"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { foodSchema, FoodFormData, foodCategories, units } from "@/lib/validation/food";
import { Modal } from "@/components/ui/Modal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useFoods } from "@/hooks/useFoods";
import { useToast } from "@/context/ToastProvider";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { categoryMeta } from "@/data/categories";
import { FoodItem } from "@/types";
import { fileToCompressedDataUrl } from "@/lib/image";
import { Camera, X as XIcon } from "lucide-react";

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editFood?: FoodItem | null;
  onSuccess?: () => void;
}

export function FoodFormModal({ isOpen, onClose, editFood, onSuccess }: FoodFormModalProps) {
  const { addFood, updateFood } = useFoods();
  const { showToast } = useToast();
  const isDesktop = useIsDesktop();
  const [showAddAnother, setShowAddAnother] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FoodFormData>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "unidades",
      category: "otros",
      expiresAt: "",
      notes: "",
      photoUrl: "",
    },
  });

  useEffect(() => {
    if (editFood) {
      setValue("name", editFood.name);
      setValue("quantity", editFood.quantity);
      setValue("unit", editFood.unit);
      setValue("category", editFood.category);
      setValue("expiresAt", editFood.expiresAt);
      setValue("notes", editFood.notes || "");
      setValue("photoUrl", editFood.photoUrl || "");
      setPhotoPreview(editFood.photoUrl || "");
    } else {
      reset({
        name: "",
        quantity: 1,
        unit: "unidades",
        category: "otros",
        expiresAt: "",
        notes: "",
        photoUrl: "",
      });
      setPhotoPreview("");
    }
  }, [editFood, isOpen, setValue, reset]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Selecciona un archivo de imagen válido", "error");
      return;
    }
    setIsProcessingPhoto(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setValue("photoUrl", dataUrl);
      setPhotoPreview(dataUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar la foto";
      showToast(message, "error");
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = () => {
    setValue("photoUrl", "");
    setPhotoPreview("");
  };

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setValue("expiresAt", `${yyyy}-${mm}-${dd}`);
  };

  const onSubmit = async (data: FoodFormData) => {
    try {
      if (editFood) {
        await updateFood({
          ...editFood,
          name: data.name.trim(),
          quantity: Number(data.quantity),
          unit: data.unit,
          category: data.category,
          expiresAt: data.expiresAt,
          notes: data.notes?.trim() || "",
          photoUrl: data.photoUrl || "",
        });
        showToast("Alimento actualizado");
        onClose();
      } else {
        await addFood({
          name: data.name.trim(),
          quantity: Number(data.quantity),
          unit: data.unit,
          category: data.category,
          expiresAt: data.expiresAt,
          notes: data.notes?.trim() || "",
          photoUrl: data.photoUrl || "",
        });
        showToast("Alimento agregado");
        if (showAddAnother) {
          reset({
            name: "",
            quantity: 1,
            unit: "unidades",
            category: "otros",
            expiresAt: "",
            notes: "",
            photoUrl: "",
          });
          setPhotoPreview("");
          setShowAddAnother(false);
        } else {
          onClose();
        }
      }
      if (onSuccess) onSuccess();
    } catch (e: any) {
      showToast(e.message || "Error al guardar", "error");
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Foto (opcional)</label>
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Foto del alimento" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                aria-label="Quitar foto"
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <XIcon size={14} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border border-dashed border-border flex items-center justify-center text-ink-muted flex-shrink-0">
              <Camera size={24} />
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
          {...register("expiresAt")}
          error={errors.expiresAt?.message}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          <Button type="button" variant="secondary" size="sm" onClick={() => addDays(3)}>
            +3 días
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => addDays(7)}>
            +1 semana
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => addDays(30)}>
            +1 mes
          </Button>
        </div>
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

  const title = editFood ? "Editar alimento" : "Agregar alimento";

  return isDesktop ? (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {formContent}
    </Modal>
  ) : (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      {formContent}
    </BottomSheet>
  );
}
