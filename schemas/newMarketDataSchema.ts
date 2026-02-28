import { z } from "zod";

export type marketData = {
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

export const NewProviderSchema = z.object({
  providerName: z.string().min(1, "Provider name is required"),
  endpoint: z.string().min(1, "Endpoint is required"),
  apiKey: z.string().min(1, "API key is required"),
  syncFrequency: z.string().min(1, "Sync frequency is required"),
  slug: z.any().optional(),
});

export type NewProviderSchemaValues = z.infer<typeof NewProviderSchema>;
