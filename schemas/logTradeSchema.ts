import { z } from "zod";

export const logTradeSchema = z.object({
    direction: z.enum(["LONG", "SHORT"]),
    pair: z.string().min(1, "Pair is required"),
    custom_pair: z.string().optional(),
    session: z.string().min(1, "Session is required"),
    date: z.string().min(1, "Date is required"),
    entry_price: z.union([z.string(), z.number()]).optional(),
    exit_price: z.union([z.string(), z.number()]).optional(),
    sl: z.union([z.string(), z.number()]).optional(),
    lot_size: z.union([z.string(), z.number()]).optional(),
    rr: z.string().optional(),
    pnl: z.string().min(1, "P&L is required"),
    setup: z.string().min(1, "Setup is required"),
    emotion: z.string().min(1, "Emotion is required"),
    broker: z.string().min(1, "Broker is required"),
    custom_broker: z.string().optional(),
    account_id: z.string().optional(),
    notes: z.string().optional(),
    checklist_results: z.record(z.string(), z.boolean()).optional(),
});

export type LogTradeFormValues = z.infer<typeof logTradeSchema>;
