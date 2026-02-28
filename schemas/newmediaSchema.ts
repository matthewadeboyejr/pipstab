import { z } from "zod";

// Media categories
export const MEDIA_CATEGORIES = ["beginner", "advanced"] as const;

export const NewMediaSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    category: z.enum(MEDIA_CATEGORIES),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1000, "Description must be less than 1000 characters"),
    videoFile: z
      .instanceof(File, { message: "Video file is required" })
      .optional(),
    transcript: z.string().optional(),
    transcriptFile: z.instanceof(File).optional(),
    tags: z.array(z.string()).optional(),
    featuredImage: z.instanceof(File).optional(),

    slug: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate video file - it's required
    if (!data.videoFile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Video file is required",
        path: ["videoFile"],
      });
    }

    if (!data.transcript && !data.transcriptFile) {
      // Transcript is optional, so no validation needed
    }
  });

export type NewMediaSchemaValues = z.infer<typeof NewMediaSchema>;

// Media file interface for API responses
export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploaded_by: string;
  created_at: string;
}

// Media response interface
export interface MediaResponse {
  success: boolean;
  media: MediaFile[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
