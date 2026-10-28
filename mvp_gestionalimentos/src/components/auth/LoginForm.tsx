"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Error al iniciar sesión");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        autoComplete="current-password"
        {...register("password")}
        error={errors.password?.message}
      />
      {error && <p className="text-sm text-expired">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
