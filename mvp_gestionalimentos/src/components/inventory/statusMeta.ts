/**
 * Visual language of the traffic light, shared by every screen.
 * Each status always has the same color, icon and name (Gestalt: similarity),
 * so urgency never depends on color alone.
 */
import { AlertTriangle, CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";
import { ExpiryStatus } from "@/types";

export const statusMeta: Record<
  ExpiryStatus,
  { label: string; icon: LucideIcon; text: string; soft: string; solid: string; border: string }
> = {
  expired: {
    label: "Vencido",
    icon: XCircle,
    text: "text-expired",
    soft: "bg-expired-soft",
    solid: "bg-expired",
    border: "border-l-expired",
  },
  critical: {
    label: "Úsalo ya",
    icon: AlertTriangle,
    text: "text-critical-ink",
    soft: "bg-critical-soft",
    solid: "bg-critical",
    border: "border-l-critical",
  },
  soon: {
    label: "Pronto",
    icon: Clock,
    text: "text-soon-ink",
    soft: "bg-soon-soft",
    solid: "bg-soon",
    border: "border-l-soon",
  },
  fresh: {
    label: "Fresco",
    icon: CheckCircle2,
    text: "text-fresh-ink",
    soft: "bg-fresh-soft",
    solid: "bg-fresh",
    border: "border-l-fresh",
  },
};

/** Display order: most urgent first. */
export const statusOrder: ExpiryStatus[] = ["expired", "critical", "soon", "fresh"];
