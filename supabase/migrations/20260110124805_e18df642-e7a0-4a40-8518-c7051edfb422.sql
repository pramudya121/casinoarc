-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_address TEXT NOT NULL,
  referred_address TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  commission_earned NUMERIC NOT NULL DEFAULT 0,
  commission_claimed NUMERIC NOT NULL DEFAULT 0,
  games_by_referred INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  total_commission NUMERIC NOT NULL DEFAULT 0,
  commission_rate NUMERIC NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Referrals policies
CREATE POLICY "Anyone can view referrals" 
ON public.referrals 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update referrals" 
ON public.referrals 
FOR UPDATE 
USING (true);

-- Referral codes policies
CREATE POLICY "Anyone can view referral codes" 
ON public.referral_codes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert referral codes" 
ON public.referral_codes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update referral codes" 
ON public.referral_codes 
FOR UPDATE 
USING (true);

-- Create indexes
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_address);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_address);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(referral_code);
CREATE INDEX idx_referral_codes_wallet ON public.referral_codes(wallet_address);