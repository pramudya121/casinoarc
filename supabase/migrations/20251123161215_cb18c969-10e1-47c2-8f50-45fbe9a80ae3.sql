-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create game_history table
CREATE TABLE public.game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  game_name TEXT NOT NULL,
  bet_amount DECIMAL NOT NULL,
  win_amount DECIMAL DEFAULT 0,
  result BOOLEAN NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create game_state table (for sessions)
CREATE TABLE public.game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  state JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leaderboard_casino table
CREATE TABLE public.leaderboard_casino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  username TEXT,
  total_wagered DECIMAL DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  biggest_win DECIMAL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leaderboard_trader table
CREATE TABLE public.leaderboard_trader (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  username TEXT,
  total_profit DECIMAL DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  wallet_address TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create game_settings table
CREATE TABLE public.game_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name TEXT UNIQUE NOT NULL,
  min_bet DECIMAL NOT NULL DEFAULT 0.01,
  max_bet DECIMAL NOT NULL DEFAULT 100,
  house_edge DECIMAL NOT NULL DEFAULT 2.5,
  rtp DECIMAL NOT NULL DEFAULT 97.5,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_casino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_trader ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (true);

-- RLS Policies for game_history
CREATE POLICY "Anyone can view game history" ON public.game_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game history" ON public.game_history FOR INSERT WITH CHECK (true);

-- RLS Policies for game_state
CREATE POLICY "Users can view all game states" ON public.game_state FOR SELECT USING (true);
CREATE POLICY "Anyone can insert game state" ON public.game_state FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update game state" ON public.game_state FOR UPDATE USING (true);

-- RLS Policies for leaderboards
CREATE POLICY "Anyone can view casino leaderboard" ON public.leaderboard_casino FOR SELECT USING (true);
CREATE POLICY "Anyone can update casino leaderboard" ON public.leaderboard_casino FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can modify casino leaderboard" ON public.leaderboard_casino FOR UPDATE USING (true);

CREATE POLICY "Anyone can view trader leaderboard" ON public.leaderboard_trader FOR SELECT USING (true);
CREATE POLICY "Anyone can update trader leaderboard" ON public.leaderboard_trader FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can modify trader leaderboard" ON public.leaderboard_trader FOR UPDATE USING (true);

-- RLS Policies for audit_logs
CREATE POLICY "Anyone can view audit logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for game_settings
CREATE POLICY "Anyone can view game settings" ON public.game_settings FOR SELECT USING (true);

-- Insert default game settings
INSERT INTO public.game_settings (game_name, min_bet, max_bet, house_edge, rtp) VALUES
  ('coinflip', 0.01, 100, 2.5, 97.5),
  ('range', 0.01, 100, 2.5, 97.5),
  ('slots', 0.01, 100, 5, 95),
  ('mines', 0.01, 100, 3, 97),
  ('plinko', 0.01, 100, 2, 98),
  ('rps', 0.01, 100, 2.5, 97.5),
  ('videopoker', 0.01, 100, 3, 97),
  ('baccarat', 0.01, 100, 1.5, 98.5),
  ('roulette', 0.01, 100, 2.7, 97.3),
  ('limbo', 0.01, 100, 2, 98),
  ('fishprawncrab', 0.01, 100, 2.5, 97.5);

-- Create indexes for better performance
CREATE INDEX idx_game_history_wallet ON public.game_history(wallet_address);
CREATE INDEX idx_game_history_created ON public.game_history(created_at DESC);
CREATE INDEX idx_leaderboard_casino_wagered ON public.leaderboard_casino(total_wagered DESC);
CREATE INDEX idx_leaderboard_trader_profit ON public.leaderboard_trader(total_profit DESC);