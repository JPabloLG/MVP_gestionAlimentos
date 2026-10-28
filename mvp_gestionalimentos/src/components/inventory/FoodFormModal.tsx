"use client";

import React, { useEffect, useState } from "react";
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
import { categoryMeta } from "@/data/categories";
import { FoodItem } from "@/types";

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editFood?: FoodItem | null;
  onSuccess?: () => void;
}

export function FoodFormModal({ isOpen, onClose, editFood, onSuccess }: FoodFormModalProps) {
  const { addFood, updateFood } = useFoods();
  const { showToast } = useToast();
  const [showAddAnother, setShowAddAnother] = useState(false);

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
    } else {
      reset({
        name: "",
        quantity: 1,
        unit: "unidades",
        category: "otros",
        expiresAt: "",
        notes: "",
      });
    }
  }, [editFood, isOpen, setValue, reset]);

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
          });
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

  return (
    <>
      <div className="hidden md:block">
        <Modal isOpen={isOpen} onClose={onClose} title={editFood ? "Editar alimento" : "Agregar alimento"}>
          {formContent}
        </Modal>
      </div>
      <div className="md:hidden">
        <BottomSheet isOpen={isOpen} onClose={onClose} title={editFood ? "Editar alimento" : "Agregar alimento"}>
          {formContent}
        </BottomSheet>
      </div>
    </>
  );
}
