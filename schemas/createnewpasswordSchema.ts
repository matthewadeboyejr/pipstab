import { z } from "zod";

export const CreateNewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
        "Password must contain letters, numbers, and special characters"
      ),
    repeatPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"]
  });

export type CreateNewPasswordSchemaValues = z.infer<
  typeof CreateNewPasswordSchema
>;
