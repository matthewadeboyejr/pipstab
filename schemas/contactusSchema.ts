import { z } from "zod";

export const ContactUsSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  question: z.string().min(1, "Question is required")
});

export type ContactusFormvalues = z.infer<typeof ContactUsSchema>;
