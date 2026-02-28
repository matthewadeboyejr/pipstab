import { z } from "zod";

export const UpdateTicketSchema = z.object({
  notes: z.string().min(1, "Description is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  assigned: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional()
  //   label: z.string().min(1, "Label is required"),
  //   priority: z.string().min(1, "Priority is required")
});

export type UpdateTicketSchemaValues = z.infer<typeof UpdateTicketSchema>;
