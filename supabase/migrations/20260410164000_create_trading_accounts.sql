-- Create trading_accounts table
CREATE TABLE public.trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    broker TEXT NOT NULL,
    account_number TEXT,
    initial_balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own trading accounts" ON public.trading_accounts
    FOR ALL USING (auth.uid() = user_id);

-- Add account_id to trades table
ALTER TABLE public.trades ADD COLUMN account_id UUID REFERENCES public.trading_accounts(id) ON DELETE SET NULL;

-- Data Migration: Create a default account for every user who already has trades
INSERT INTO public.trading_accounts (user_id, name, broker)
SELECT DISTINCT user_id, 'Primary Account', 'Manual'
FROM public.trades;

-- Link existing trades to the newly created primary account for each user
UPDATE public.trades t
SET account_id = a.id
FROM public.trading_accounts a
WHERE t.user_id = a.user_id AND a.name = 'Primary Account';
