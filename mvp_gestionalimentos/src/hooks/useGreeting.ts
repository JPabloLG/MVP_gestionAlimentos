"use client";

import { getGreeting, getFirstName } from "@/lib/format";
import { useAuth } from "./useAuth";

export function useGreeting() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = user?.name ? getFirstName(user.name) : "";
  return { greeting, firstName, fullGreeting: firstName ? `${greeting}, ${firstName} ☀️` : greeting };
}
