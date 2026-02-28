import { z } from "zod";

export const PERMISSIONS = {
  "User Management": [
    { key: "view_users", label: "View Users" },
    { key: "edit_users", label: "Edit Users" },
    { key: "delete_users", label: "Delete Users" }
  ],
  "Role Management": [
    { key: "view_roles", label: "View Roles" },
    { key: "edit_roles", label: "Edit Roles" }
  ],
  "Data Management": [
    { key: "view_tokens", label: "View Tokens" },
    { key: "edit_tokens", label: "Edit Tokens" }
  ],
  "Content Management": [
    { key: "view_content", label: "View Content" },
    { key: "edit_content", label: "Edit Content" },
    { key: "publish_content", label: "Publish Content" }
  ],
  Support: [
    { key: "view_tickets", label: "View Tickets" },
    { key: "handle_tickets", label: "Handle Tickets" }
  ],
  Analytics: [{ key: "view_analytics", label: "View Analytics" }],
  Billing: [
    { key: "view_billing", label: "View Billing" },
    { key: "manage_billing", label: "Manage Billing" }
  ],
  "AI Management": [{ key: "manage_ai_prompts", label: "Manage AI Prompts" }],
  System: [{ key: "system_config", label: "System Configuration" }]
} as const;

export type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
};

export const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission")
});

export type RoleFormValues = z.infer<typeof RoleSchema>;
