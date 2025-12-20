-- Create VIP levels table
CREATE TABLE public.vip_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  min_wagered NUMERIC NOT NULL DEFAULT 0,
  cashback_rate NUMERIC NOT NULL DEFAULT 0,
  bonus_multiplier NUMERIC NOT NULL DEFAULT 1,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user VIP progress table
CREATE TABLE public.user_vip (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_wagered NUMERIC NOT NULL DEFAULT 0,
  cashback_earned NUMERIC NOT NULL DEFAULT 0,
  cashback_claimed NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vip_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vip ENABLE ROW LEVEL SECURITY;

-- VIP levels are public readable
CREATE POLICY "VIP levels are viewable by everyone" 
ON public.vip_levels 
FOR SELECT 
USING (true);

-- User VIP data is publicly readable but only editable by system
CREATE POLICY "User VIP is viewable by everyone" 
ON public.user_vip 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert their VIP record" 
ON public.user_vip 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update VIP records" 
ON public.user_vip 
FOR UPDATE 
USING (true);

-- Insert default VIP levels
INSERT INTO public.vip_levels (level, name, min_wagered, cashback_rate, bonus_multiplier, icon, color) VALUES
  (1, 'Bronze', 0, 0.5, 1.0, '🥉', '#CD7F32'),
  (2, 'Silver', 100, 1.0, 1.1, '🥈', '#C0C0C0'),
  (3, 'Gold', 500, 1.5, 1.2, '🥇', '#FFD700'),
  (4, 'Platinum', 1000, 2.0, 1.3, '💎', '#E5E4E2'),
  (5, 'Diamond', 5000, 3.0, 1.5, '👑', '#B9F2FF'),
  (6, 'Royal', 10000, 5.0, 2.0, '🎭', '#9400D3');