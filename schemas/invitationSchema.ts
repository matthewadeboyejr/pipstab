import { z } from "zod";

export const InvitationSchema = z
  .object({
    fullname: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    role: z.union([z.string(), z.array(z.string())]).optional(),
    plan: z.union([z.string(), z.array(z.string())]).optional(),
    message: z.string().optional()
  })
  // Validate role
  .refine(
    (data) => (Array.isArray(data.role) ? data.role.length > 0 : !!data.role),
    {
      message: "Role is required",
      path: ["role"]
    }
  )
  // Validate subscription
  .refine(
    (data) => (Array.isArray(data.plan) ? data.plan.length > 0 : !!data.plan),
    {
      message: "Plan is required",
      path: ["plan"]
    }
  );

export type InvitationSchemaValues = z.infer<typeof InvitationSchema>;
