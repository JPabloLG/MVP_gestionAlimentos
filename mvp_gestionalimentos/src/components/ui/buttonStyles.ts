/**
 * Button look, shared by <Button> and by links that must look like buttons.
 * Lives outside the client component so server pages can use it too.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";


const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] px-4";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-surface text-ink border border-border hover:bg-surface-muted",
  ghost: "bg-transparent text-ink hover:bg-surface-muted",
  danger: "bg-expired text-white hover:bg-expired/90",
};
const sizes: Record<ButtonSize, string> = {
  sm: "text-sm h-9",
  md: "text-sm h-11",
  lg: "text-base h-12",
};

/**
 * Class names of a button, exported so links can look like buttons without
 * nesting a <button> inside an <a> (invalid HTML, confusing for screen readers).
 */
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

