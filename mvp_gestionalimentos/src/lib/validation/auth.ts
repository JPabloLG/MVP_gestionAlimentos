import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido").min(1, "El correo es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(60, "Máximo 60 caracteres"),
    email: z.string().email("Correo inválido").min(1, "El correo es obligatorio"),
    password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirma tu contraseña"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
