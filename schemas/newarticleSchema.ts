import { z } from "zod";

export type Article = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  status: string;
  label: string;
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

export type ArticleSummary = {
  totalPost: number;
  published: number;
  drafted: number;
  scheduled: number;
};

const ARTICLE_TYPES = ["Research", "Blog", "News", "Report", "Crypto"] as const;
const ARTICLE_STATUS = ["Draft", "Published", "Archived", "Scheduled"] as const;

export const NewArticleSchema = z
  .object({
    title: z.string().min(1, "Article title is required"),
    author: z.string().min(1, "Author is required"),
    type: z.enum(ARTICLE_TYPES, { message: "Type is required" }),
    status: z.enum(ARTICLE_STATUS, { message: "Status is required" }),
    content: z.string().min(1, "Content is required"),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    scheduledAt: z.string().optional(),
    scheduleDate: z.string().optional(),
    scheduleTime: z.string().optional(),
    slug: z.any().optional(),
    featuredImage: z.instanceof(File).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "Scheduled") {
      if (!data.scheduleDate || data.scheduleDate.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Schedule date is required when status is Scheduled",
          path: ["scheduleDate"],
        });
      }

      if (!data.scheduleTime || data.scheduleTime.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Schedule time is required when status is Scheduled",
          path: ["scheduleTime"],
        });
      }

      if (!data.scheduledAt || data.scheduledAt.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "scheduledAt is required when status is Scheduled",
          path: ["scheduledAt"],
        });
      }
    }
  });

export type NewArticleSchemaValues = z.infer<typeof NewArticleSchema>;
