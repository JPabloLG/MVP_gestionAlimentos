"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      await registerUser(data.name, data.email, data.password);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Error al registrarse");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Nombre completo" {...register("name")} error={errors.name?.message} />
      <Input
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Input
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...register("acceptTerms")} className="mt-1 min-h-[20px] min-w-[20px]" />
          <span>
            Acepto los{" "}
            <Link href="/terminos" className="text-primary underline">
              términos y condiciones
            </Link>
          </span>
        </label>
        {errors.acceptTerms && <p className="text-xs text-expired mt-1">{errors.acceptTerms.message}</p>}
      </div>
      {error && <p className="text-sm text-expired">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
