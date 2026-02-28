import { z } from "zod";

export type Insight = {
  id: string;
  ruleTitle: string;
  triggerType: string;
  thresholdCondition: string;
  status: string;
  type: string;
  created_at: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  tags: string[];
  featuredImage: string;
  content: string;
  seo_title: string;
  seo_description: string;
  featured_image_url: string;
  scheduled_at: string;
  updated_at: string;
  user_id: string;
};

export const NewInsightSchema = z.object({
  ruleTitle: z.string().min(1, "Rule title is required"),
  triggerType: z.string().min(1, "Trigger type is required"),
  thresholdCondition: z.string().min(1, "Threshold condition is required"),
  scheduleTime: z.string().optional(),
  slug: z.any().optional(),
});

export type NewInsightSchemaValues = z.infer<typeof NewInsightSchema>;
