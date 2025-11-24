import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TraderEntry {
  wallet_address: string;
  username?: string;
  total_profit: number;
  win_rate: number;
  games_played: number;
}

const Traders = () => {
  const [traders, setTraders] = useState<TraderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTraders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('traders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_trader'
        },
        () => {
          loadTraders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTraders = async () => {
    try {
      const { data } = await supabase
        .from('leaderboard_trader')
        .select('*')
        .order('total_profit', { ascending: false })
        .limit(20);

      setTraders(data || []);
    } catch (error) {
      console.error('Error loading traders:', error);
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
            <TrendingUp className="w-10 h-10" />
            Top Traders
          </h1>
          <p className="text-muted-foreground">Most profitable players</p>
        </div>

        <Card className="card-casino p-6 max-w-4xl mx-auto">
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : traders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No traders yet</p>
            ) : (
              traders.map((trader, index) => (
                <div
                  key={trader.wallet_address}
                  className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {trader.username || formatAddress(trader.wallet_address)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trader.games_played} games • {trader.win_rate.toFixed(1)}% win rate
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${trader.total_profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trader.total_profit >= 0 ? '+' : ''}{trader.total_profit.toFixed(2)} USDC
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
          <Card className="card-casino p-6 text-center">
            <Award className="w-10 h-10 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-primary mb-1">
              {traders.length}
            </h3>
            <p className="text-muted-foreground text-sm">Active Traders</p>
          </Card>
          <Card className="card-casino p-6 text-center">
            <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-500 mb-1">
              {traders.filter(t => t.total_profit > 0).length}
            </h3>
            <p className="text-muted-foreground text-sm">Profitable</p>
          </Card>
          <Card className="card-casino p-6 text-center">
            <Award className="w-10 h-10 text-casino-gold mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-casino-gold mb-1">
              {traders.length > 0 ? traders[0].win_rate.toFixed(1) : '0'}%
            </h3>
            <p className="text-muted-foreground text-sm">Top Win Rate</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Traders;
