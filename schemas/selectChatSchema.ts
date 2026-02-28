import { z } from "zod";

export const selectChatSchema = z.object({
  search: z.string().min(1, "Please select a user to chat with")
});

export type selectChatFormvalues = z.infer<typeof selectChatSchema>;
