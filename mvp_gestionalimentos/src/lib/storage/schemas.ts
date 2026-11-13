/**
 * Shapes of the values persisted in `localStorage`, validated on every read.
 *
 * They describe the data as it has always been stored: new fields must be
 * optional so values written by older versions keep loading. Unknown fields
 * are preserved (`passthrough`) so an older build never strips data written
 * by a newer one.
 */
import { z } from "zod";
import { isValidDateString } from "@/lib/expiry";
import { foodCategories, units } from "@/lib/validation/food";

export const storedFoodSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().finite().positive(),
    unit: z.enum(units),
    category: z.enum(foodCategories),
    expiresAt: z.string().refine(isValidDateString),
    notes: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

const counter = z.number().int().nonnegative();
export const storedStatsSchema = z.object({ rescued: counter, wasted: counter });

export const storedSessionSchema = z.object({ userId: z.string().min(1), token: z.string().optional() });

export const storedUserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    email: z.string().min(1),
    createdAt: z.string(),
    passwordHash: z.string().min(1),
    salt: z.string().min(1),
  })
  .passthrough();
