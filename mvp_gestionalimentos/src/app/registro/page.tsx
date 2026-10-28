"use client";

import React, { useEffect } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-display mb-2">Crear cuenta</h1>
          <p className="text-ink-muted">Empieza a reducir el desperdicio</p>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
          <RegisterForm />
        </div>
        <p className="text-center mt-4 text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
