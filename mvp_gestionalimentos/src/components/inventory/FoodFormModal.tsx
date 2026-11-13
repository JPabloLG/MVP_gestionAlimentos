"use client";

/**
 * Create / edit form for a food (RF-03, RF-05).
 *
 * Built for fast entry, because rigid data entry is why inventory apps get
 * abandoned: date shortcuts, a suggested date when the real one is unknown,
 * remembered unit and category, focus on the name, an "add another" mode that
 * keeps the form open, and a warning before registering something the user
 * already has (fewer unnecessary re-purchases).
 */
import React, { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { foodSchema, FoodFormData, foodCategories, units } from "@/lib/validation/food";
import { Modal } from "@/components/ui/Modal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useFoods } from "@/hooks/useFoods";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastProvider";
import { categoryMeta } from "@/data/categories";
import { FoodItem } from "@/types";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { dateInDays, getDaysRemaining, getExpiryLabel } from "@/lib/expiry";
import { findDuplicates, suggestExpiryDate } from "@/lib/foods";
import { FormPrefs, getFormPrefs, saveFormPrefs } from "@/lib/preferences";
import { fileToCompressedDataUrl } from "@/lib/image";
import { Camera, X as XIcon } from "lucide-react";

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editFood?: FoodItem | null;
  onSuccess?: () => void;
}

const DATE_SHORTCUTS = [
  { label: "Hoy", days: 0 },
  { label: "+3 días", days: 3 },
  { label: "+1 semana", days: 7 },
  { label: "+2 semanas", days: 14 },
  { label: "+1 mes", days: 30 },
];

function blankValues(prefs: FormPrefs): FoodFormData {
  return {
    name: "",
    quantity: 1,
    unit: prefs.unit,
    category: prefs.category,
    expiresAt: "",
    notes: "",
    expiryIsEstimated: false,
    photoUrl: "",
  };
}

function toFormValues(food: FoodItem): FoodFormData {
  return {
    name: food.name,
    quantity: food.quantity,
    unit: food.unit,
    category: food.category,
    expiresAt: food.expiresAt,
    notes: food.notes || "",
    expiryIsEstimated: food.expiryIsEstimated ?? false,
    photoUrl: food.photoUrl || "",
  };
}

export function FoodFormModal({ isOpen, onClose, editFood, onSuccess }: FoodFormModalProps) {
  const { foods, addFood, updateFood } = useFoods();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [showAddAnother, setShowAddAnother] = useState(false);
  // Foods the user already has with the same name, shown before creating another one.
  const [duplicates, setDuplicates] = useState<FoodItem[]>([]);
  // Set when the user chooses "edit the existing one" from the duplicate warning.
  const [switchedTo, setSwitchedTo] = useState<FoodItem | null>(null);
  const userId = user?.id;
  const target = switchedTo ?? editFood ?? null;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: blankValues(getFormPrefs(undefined)),
  });

  const formId = useId();
  // Focus through the DOM: `reset` drops React Hook Form's field refs until the next render.
  const focusName = () =>
    document.getElementById(formId)?.querySelector<HTMLInputElement>('[name="name"]')?.focus();

  // Every time the form opens (or switches to another food): load the food being
  // edited or a blank form with the remembered unit/category, and focus the name.
  useEffect(() => {
    if (!isOpen) return;
    reset(target ? toFormValues(target) : blankValues(getFormPrefs(userId)));
    document.getElementById(formId)?.querySelector<HTMLInputElement>('[name="name"]')?.focus();
  }, [isOpen, target, userId, reset, formId]);

  const isEstimated = useWatch({ control, name: "expiryIsEstimated" });
  const photoPreview = useWatch({ control, name: "photoUrl" });
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photos are downscaled and compressed so they fit in localStorage.
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Selecciona un archivo de imagen válido", "error");
      return;
    }
    setIsProcessingPhoto(true);
    try {
      setValue("photoUrl", await fileToCompressedDataUrl(file));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo cargar la foto", "error");
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const setDate = (date: string, estimated: boolean) => {
    setValue("expiresAt", date, { shouldValidate: true });
    setValue("expiryIsEstimated", estimated);
  };

  const close = () => {
    setDuplicates([]);
    setSwitchedTo(null);
    onClose();
  };

  const save = async (data: FoodFormData) => {
    const values = {
      name: data.name,
      quantity: Number(data.quantity),
      unit: data.unit,
      category: data.category,
      expiresAt: data.expiresAt,
      notes: data.notes?.trim() || "",
      // Stored only when true so foods keep the same shape as before this field existed.
      expiryIsEstimated: data.expiryIsEstimated || undefined,
      photoUrl: data.photoUrl || undefined,
    };
    if (target) {
      if (!(await updateFood({ ...target, ...values }))) return;
      showToast("Alimento actualizado");
      close();
    } else {
      if (!(await addFood(values))) return;
      showToast("Alimento agregado");
      setDuplicates([]);
      const prefs = { unit: values.unit, category: values.category };
      saveFormPrefs(userId, prefs);
      if (showAddAnother) {
        reset(blankValues(prefs));
        focusName();
      } else {
        close();
      }
    }
    if (onSuccess) onSuccess();
  };

  // Creating a food the user already has asks first; the warning offers both ways out.
  const onSubmit = async (data: FoodFormData) => {
    const existing = target ? [] : findDuplicates(data.name, foods);
    if (existing.length > 0) {
      setDuplicates(existing);
      return;
    }
    await save(data);
  };

  const duplicate = duplicates[0];

  const formContent = (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <span className="block text-sm font-medium mb-2">Foto (opcional)</span>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border shrink-0">
              {/* Data URL from the camera: next/image cannot optimize it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Foto del alimento" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setValue("photoUrl", "")}
                aria-label="Quitar foto"
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <XIcon size={14} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border border-dashed border-border flex items-center justify-center text-ink-muted shrink-0">
              <Camera size={24} aria-hidden="true" />
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingPhoto}
          >
            {isProcessingPhoto ? "Procesando..." : photoPreview ? "Cambiar foto" : "Agregar foto"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
      </div>
      <Input
        label="Nombre"
        {...register("name", { onChange: () => setDuplicates([]) })}
        error={errors.name?.message}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cantidad"
          type="number"
          inputMode="decimal"
          step="any"
          {...register("quantity", { valueAsNumber: true })}
          error={errors.quantity?.message}
        />
        <Select
          label="Unidad"
          options={units.map((u) => ({ value: u, label: u }))}
          {...register("unit")}
          error={errors.unit?.message}
        />
      </div>
      <fieldset>
        <legend className="block text-sm font-medium mb-2">Categoría</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {foodCategories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 p-2 min-h-[44px] rounded-xl border border-border cursor-pointer hover:bg-surface-muted has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40"
            >
              <input type="radio" value={cat} {...register("category")} className="sr-only" />
              <span aria-hidden="true">{categoryMeta[cat].emoji}</span>
              <span className="text-sm">{categoryMeta[cat].label}</span>
            </label>
          ))}
        </div>
        {errors.category && <p className="text-xs text-expired mt-1">{errors.category.message}</p>}
      </fieldset>
      <div>
        <Input
          label="Fecha de vencimiento o deterioro estimado"
          type="date"
          {...register("expiresAt", { onChange: () => setValue("expiryIsEstimated", false) })}
          error={errors.expiresAt?.message}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {DATE_SHORTCUTS.map((shortcut) => (
            <Button
              key={shortcut.label}
              type="button"
              variant="secondary"
              size="sm"
              className="px-3!"
              onClick={() => setDate(dateInDays(shortcut.days), false)}
            >
              {shortcut.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 px-2! text-primary"
          onClick={() => setDate(suggestExpiryDate(getValues("category")), true)}
        >
          No sé la fecha: sugerir según la categoría
        </Button>
        {isEstimated && (
          <p className="text-xs text-ink mt-1">
            ≈ Fecha estimada para esta categoría. Es orientativa: cámbiala si conoces la fecha real.
          </p>
        )}
        <p className="text-xs text-ink-muted mt-1">Puedes registrar fechas pasadas si ya está vencido.</p>
      </div>
      <Input label="Notas (opcional)" {...register("notes")} error={errors.notes?.message} />
      {!target && (
        <label className="flex items-center gap-2 text-sm min-h-[44px]">
          <input
            type="checkbox"
            checked={showAddAnother}
            onChange={(e) => setShowAddAnother(e.target.checked)}
            className="min-h-[20px] min-w-[20px]"
          />
          Agregar otro después de guardar
        </label>
      )}
      {duplicate && (
        <div role="alert" className="rounded-xl border border-soon bg-soon-soft p-3 text-sm space-y-2">
          <p>
            Ya tienes <strong>{duplicate.name}</strong>: {duplicate.quantity} {duplicate.unit} (
            {getExpiryLabel(getDaysRemaining(duplicate.expiresAt)).toLowerCase()})
            {duplicates.length > 1 && ` y ${duplicates.length - 1} registro(s) más`}. ¿Qué quieres hacer?
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button type="button" variant="secondary" size="sm" onClick={handleSubmit(save)}>
              Agregar aparte
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setDuplicates([]);
                setSwitchedTo(duplicate);
              }}
            >
              Editar el existente
            </Button>
          </div>
        </div>
      )}
      <div className="flex gap-2 sticky bottom-0 bg-surface pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={close}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : target ? "Guardar cambios" : "Agregar"}
        </Button>
      </div>
    </form>
  );

  // One container only: rendering both and hiding one by CSS duplicated the form.
  const Container = isDesktop ? Modal : BottomSheet;
  return (
    <Container isOpen={isOpen} onClose={close} title={target ? "Editar alimento" : "Agregar alimento"}>
      {formContent}
    </Container>
  );
}
