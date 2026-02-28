import { z } from "zod";

export const MakeNewPasswordSchema = (hasEmailLogin: boolean) =>
  z
    .object({
      old_password: hasEmailLogin
        ? z.string().min(1, "Current password is required")
        : z.string().optional(),
      new_password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
          "Password must contain letters, numbers, and special characters"
        ),
      repeat_new_password: z.string().min(1, "Please confirm your password")
    })
    .refine((data) => data.new_password === data.repeat_new_password, {
      message: "Passwords do not match",
      path: ["repeat_new_password"]
    });

export type MakeNewPasswordSchemaValues = z.infer<
  ReturnType<typeof MakeNewPasswordSchema>
>;
