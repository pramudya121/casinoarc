import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  wallet_address: string;
  username?: string;
  total_wagered: number;
  total_wins: number;
  biggest_win: number;
}

const Leaderboard = () => {
  const [topWagered, setTopWagered] = useState<LeaderboardEntry[]>([]);
  const [topWinners, setTopWinners] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_casino'
        },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: wagered } = await supabase
        .from('leaderboard_casino')
        .select('*')
        .order('total_wagered', { ascending: false })
        .limit(10);

      const { data: winners } = await supabase
        .from('leaderboard_casino')
        .select('*')
        .order('biggest_win', { ascending: false })
        .limit(10);

      setTopWagered(wagered || []);
      setTopWinners(winners || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black mb-2 text-gradient-red glow-red flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10" />
            Casino Leaderboard
          </h1>
          <p className="text-muted-foreground">Top players and biggest wins</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-casino p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Top Wagered
            </h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : topWagered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data yet</p>
              ) : (
                topWagered.map((entry, index) => (
                  <div
                    key={entry.wallet_address}
                    className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.username || formatAddress(entry.wallet_address)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.total_wins} wins
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {entry.total_wagered.toFixed(2)} USDC
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="card-casino p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Biggest Wins
            </h2>
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : topWinners.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No data yet</p>
              ) : (
                topWinners.map((entry, index) => (
                  <div
                    key={entry.wallet_address}
                    className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {entry.username || formatAddress(entry.wallet_address)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">
                        {entry.biggest_win.toFixed(2)} USDC
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
