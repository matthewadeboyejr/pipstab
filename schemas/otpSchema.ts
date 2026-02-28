import { z } from "zod";

export const otpSchema = z.object({
  otp: z
    .array(z.string().regex(/^\d$/, "Must be a single digit"))
    .length(4, "OTP must be 4 digits")
});

export type OtpFormValues = z.infer<typeof otpSchema>;
