"use client";

import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
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
          <h1 className="text-2xl font-display mb-2">Iniciar sesión</h1>
          <p className="text-ink-muted">Bienvenido de vuelta</p>
        </div>
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
          <LoginForm />
        </div>
        <p className="text-center mt-4 text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
