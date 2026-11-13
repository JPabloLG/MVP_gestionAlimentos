"use client";

/**
 * Create / edit form for a food (RF-03, RF-05).
 *
 * Built for fast entry, because rigid data entry is why inventory apps get
 * abandoned: date shortcuts, remembered unit and category, focus on the name
 * and an "add another" mode that keeps the form open.
 */
import React, { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
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
import { dateInDays } from "@/lib/expiry";
import { suggestExpiryDate } from "@/lib/foods";
import { FormPrefs, getFormPrefs, saveFormPrefs } from "@/lib/preferences";

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
  };
}

export function FoodFormModal({ isOpen, onClose, editFood, onSuccess }: FoodFormModalProps) {
  const { addFood, updateFood } = useFoods();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [showAddAnother, setShowAddAnother] = useState(false);
  const userId = user?.id;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: blankValues(getFormPrefs(undefined)),
  });

  const formId = useId();
  // Focus through the DOM: `reset` drops React Hook Form's field refs until the next render.
  const focusName = () =>
    document.getElementById(formId)?.querySelector<HTMLInputElement>('[name="name"]')?.focus();

  // Every time the form opens: load the food being edited or a blank form with
  // the remembered unit/category, and put the cursor on the name.
  useEffect(() => {
    if (!isOpen) return;
    reset(editFood ? toFormValues(editFood) : blankValues(getFormPrefs(userId)));
    document.getElementById(formId)?.querySelector<HTMLInputElement>('[name="name"]')?.focus();
  }, [isOpen, editFood, userId, reset, formId]);

  const isEstimated = watch("expiryIsEstimated");
  const setDate = (date: string, estimated: boolean) => {
    setValue("expiresAt", date, { shouldValidate: true });
    setValue("expiryIsEstimated", estimated);
  };

  const onSubmit = async (data: FoodFormData) => {
    const values = {
      name: data.name,
      quantity: Number(data.quantity),
      unit: data.unit,
      category: data.category,
      expiresAt: data.expiresAt,
      notes: data.notes?.trim() || "",
      // Stored only when true so foods keep the same shape as before this field existed.
      expiryIsEstimated: data.expiryIsEstimated || undefined,
    };
    if (editFood) {
      if (!(await updateFood({ ...editFood, ...values }))) return;
      showToast("Alimento actualizado");
      onClose();
    } else {
      if (!(await addFood(values))) return;
      showToast("Alimento agregado");
      const prefs = { unit: values.unit, category: values.category };
      saveFormPrefs(userId, prefs);
      if (showAddAnother) {
        reset(blankValues(prefs));
        focusName();
      } else {
        onClose();
      }
    }
    if (onSuccess) onSuccess();
  };

  const formContent = (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre" {...register("name")} error={errors.name?.message} />
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
      <div>
        <label className="block text-sm font-medium mb-2">Categoría</label>
        <div className="grid grid-cols-2 gap-2">
          {foodCategories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 p-2 rounded-xl border border-border cursor-pointer hover:bg-surface-muted has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <input type="radio" value={cat} {...register("category")} className="sr-only" />
              <span>{categoryMeta[cat].emoji}</span>
              <span className="text-sm">{categoryMeta[cat].label}</span>
            </label>
          ))}
        </div>
        {errors.category && <p className="text-xs text-expired mt-1">{errors.category.message}</p>}
      </div>
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
          className="mt-2"
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
      {!editFood && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAddAnother}
            onChange={(e) => setShowAddAnother(e.target.checked)}
            className="min-h-[20px] min-w-[20px]"
          />
          Agregar otro después de guardar
        </label>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : editFood ? "Guardar cambios" : "Agregar"}
        </Button>
      </div>
    </form>
  );

  // One container only: rendering both and hiding one by CSS duplicated the form.
  const Container = isDesktop ? Modal : BottomSheet;
  return (
    <Container isOpen={isOpen} onClose={onClose} title={editFood ? "Editar alimento" : "Agregar alimento"}>
      {formContent}
    </Container>
  );
}
