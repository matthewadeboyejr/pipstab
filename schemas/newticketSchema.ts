import { z } from "zod";

export type Ticket = {
  id: string;
  title: string;
  ticket_id: string;
  description: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned: string | null;
  label: string;
  priority: "low" | "medium" | "high";
  user_type: "staff" | "user";
  created_at: string;
  notes?: string;
  user_id: string;
  profiles?: {
    full_name: string;
    email: string;
    id: string;
  };
  assigned_profile?: {
    full_name: string;
    email: string;
    id: string;
  };
};

export const NewTicketSchema = z.object({
  title: z.string().min(1, "Ticket title is required"),
  description: z.string().min(1, "Description is required"),
  assigned: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .nullable()
    .optional(),
  label: z.string().min(1, "Label is required"),
  priority: z.string().min(1, "Priority is required"),
  user_id: z.string().min(1, "User is required")
});

export type NewTicketSchemaValues = z.infer<typeof NewTicketSchema>;
