"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-display text-lg">
        G
      </div>
      <span className="font-display text-lg font-semibold">{siteConfig.name}</span>
    </Link>
  );
}
