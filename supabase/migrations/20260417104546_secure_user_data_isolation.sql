-- Enable RLS on core trading and psychology tables
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- TRADES: Users can only see, insert, update, or delete their own trades
DROP POLICY IF EXISTS "User isolation" ON public.trades;
CREATE POLICY "User isolation" ON public.trades
    FOR ALL USING (auth.uid() = user_id);

-- SETUPS: Users can only manage their own custom setups
DROP POLICY IF EXISTS "User isolation" ON public.setups;
CREATE POLICY "User isolation" ON public.setups
    FOR ALL USING (auth.uid() = user_id);

-- CHECKINS: Users can only manage their own psychology check-ins
DROP POLICY IF EXISTS "User isolation" ON public.checkins;
CREATE POLICY "User isolation" ON public.checkins
    FOR ALL USING (auth.uid() = user_id);
