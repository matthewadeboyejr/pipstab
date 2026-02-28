import { z } from "zod";

export const forgotpasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export type ForgotPasswordFormValues = z.infer<typeof forgotpasswordSchema>;
