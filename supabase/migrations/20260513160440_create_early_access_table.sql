CREATE TABLE IF NOT EXISTS public.early_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    market TEXT,
    status TEXT DEFAULT 'pending'::text
);

-- Enable RLS
ALTER TABLE public.early_access ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public submissions)
-- Note: In a production app, you might want to add rate limiting or recaptcha
CREATE POLICY "Allow public insert to early_access" 
ON public.early_access 
FOR INSERT 
WITH CHECK (true);

-- Only allow service role to read/manage
CREATE POLICY "Allow service role full access" 
ON public.early_access 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');
