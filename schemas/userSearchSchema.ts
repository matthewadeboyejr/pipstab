import { z } from "zod";

export const UserSearchSchema = z
  .object({
    search: z.string().optional(),
    status: z.string().optional(),
    plan: z.string().optional(),
    priority: z.string().optional()
  })
  .refine((data) => data.search || data.status || data.plan, {
    message: "At least one field is required",
    path: ["search"]
  });

export type UserSearchFormvalues = z.infer<typeof UserSearchSchema>;
