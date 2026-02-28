import { z } from "zod";

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  job_title: z.string().optional()
});

export type UpdateProfileSchemaValues = z.infer<typeof UpdateProfileSchema>;
