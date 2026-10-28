"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/Skeleton";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="hidden md:block border-b border-border bg-surface">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Skeleton className="w-32 h-8" />
            <Skeleton className="w-48 h-8" />
          </div>
        </div>
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Skeleton className="w-full h-32 mb-4" />
          <Skeleton className="w-full h-64" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
