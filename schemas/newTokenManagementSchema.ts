import { z } from "zod";

export type tokenManagement = {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  rating: string;
  links: string;
  description: string;
  logoUpload: string;
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

export const TokenManagementSchema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  rating: z.string().min(1, "Rating is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required"),
  links: z.string().min(1, "Links is required"),
  description: z.string().min(1, "Description is required"),
  logoUpload: z.string().min(1, "Logo upload is required"),
  rationale: z.string().optional(),
  slug: z.any().optional(),
});

export type TokenManagementSchemaValues = z.infer<typeof TokenManagementSchema>;
