-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  game_type TEXT NOT NULL,
  entry_fee NUMERIC NOT NULL DEFAULT 1,
  prize_pool NUMERIC NOT NULL DEFAULT 0,
  max_participants INTEGER DEFAULT 100,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament_entries table
CREATE TABLE public.tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  username TEXT,
  total_score NUMERIC DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  best_multiplier NUMERIC DEFAULT 0,
  total_wagered NUMERIC DEFAULT 0,
  total_won NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, wallet_address)
);

-- Create tournament_results table
CREATE TABLE public.tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  username TEXT,
  rank INTEGER NOT NULL,
  prize_amount NUMERIC NOT NULL,
  final_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments"
  ON public.tournaments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tournaments"
  ON public.tournaments FOR UPDATE
  USING (true);

-- RLS Policies for tournament_entries
CREATE POLICY "Anyone can view tournament entries"
  ON public.tournament_entries FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tournament entries"
  ON public.tournament_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tournament entries"
  ON public.tournament_entries FOR UPDATE
  USING (true);

-- RLS Policies for tournament_results
CREATE POLICY "Anyone can view tournament results"
  ON public.tournament_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tournament results"
  ON public.tournament_results FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_start_time ON public.tournaments(start_time);
CREATE INDEX idx_tournament_entries_tournament ON public.tournament_entries(tournament_id);
CREATE INDEX idx_tournament_entries_score ON public.tournament_entries(tournament_id, total_score DESC);

-- Insert sample tournaments
INSERT INTO public.tournaments (name, description, game_type, entry_fee, prize_pool, max_participants, start_time, end_time, status) VALUES
('Mega Coin Flip Championship', 'Compete in the ultimate coin flip tournament! Top 3 players share 1000 USDC prize pool.', 'coinflip', 5, 1000, 50, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '25 hours', 'upcoming'),
('Slots Jackpot Mania', 'Spin to win in our biggest slots tournament! Massive prizes for top performers.', 'slots', 10, 2000, 100, NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', 'upcoming'),
('Roulette Masters', 'Test your luck in the Roulette Masters tournament. 500 USDC prize pool!', 'roulette', 3, 500, 30, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '23 hours', 'active');