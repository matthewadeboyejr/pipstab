-- Migration to ensure public.outlooks table exists with RLS
CREATE TABLE IF NOT EXISTS public.outlooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    pair TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('LONG', 'SHORT', 'NEUTRAL')),
    htf_narrative TEXT,
    itf_narrative TEXT,
    ltf_narrative TEXT,
    poi_narrative TEXT,
    htf_images JSONB DEFAULT '[]'::jsonb,
    itf_images JSONB DEFAULT '[]'::jsonb,
    ltf_images JSONB DEFAULT '[]'::jsonb,
    poi_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.outlooks ENABLE ROW LEVEL SECURITY;

-- Policies for user data isolation
CREATE POLICY "Users can view their own outlooks"
    ON public.outlooks
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outlooks"
    ON public.outlooks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outlooks"
    ON public.outlooks
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outlooks"
    ON public.outlooks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_outlooks_user_id ON public.outlooks(user_id);
CREATE INDEX IF NOT EXISTS idx_outlooks_created_at ON public.outlooks(created_at DESC);
