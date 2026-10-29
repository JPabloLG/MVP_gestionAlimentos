"use client";

import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isLoading, loginDemo } = useAuth();
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await loginDemo();
      router.push("/dashboard");
    } catch {
      setIsDemoLoading(false);
    }
  };

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
          <div className="flex items-center gap-3 my-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-ink-muted">o</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
          >
            {isDemoLoading ? "Entrando..." : "Probar con cuenta demo"}
          </Button>
          <p className="text-xs text-ink-muted text-center mt-2">
            Entra con una cuenta de ejemplo ya cargada con alimentos, para explorar la app sin
            registrarte.
          </p>
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
