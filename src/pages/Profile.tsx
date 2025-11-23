import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { User, TrendingUp, TrendingDown, History } from "lucide-react";
import { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface GameHistory {
  id: string;
  game_name: string;
  bet_amount: number;
  win_amount: number;
  result: boolean;
  created_at: string;
}

const Profile = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWagered: 0,
    totalWon: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) {
      navigate('/');
      return;
    }
    loadProfile();
  }, [account]);

  const loadProfile = async () => {
    if (!account) return;

    try {
      const { data: gameHistory } = await supabase
        .from('game_history')
        .select('*')
        .eq('wallet_address', account)
        .order('created_at', { ascending: false })
        .limit(20);

      if (gameHistory) {
        setHistory(gameHistory);

        const totalGames = gameHistory.length;
        const totalWagered = gameHistory.reduce((sum, g) => sum + Number(g.bet_amount), 0);
        const totalWon = gameHistory.reduce((sum, g) => sum + Number(g.win_amount), 0);
        const wins = gameHistory.filter(g => g.result).length;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        setStats({
          totalGames,
          totalWagered,
          totalWon,
          winRate,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => 
    `${address.slice(0, 10)}...${address.slice(-8)}`;

  const profit = stats.totalWon - stats.totalWagered;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2 text-gradient-red glow-red flex items-center gap-3">
              <User className="w-10 h-10" />
              Profile
            </h1>
            <p className="text-muted-foreground">{account && formatAddress(account)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-casino p-6 text-center">
              <History className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-3xl font-bold mb-1">{stats.totalGames}</h3>
              <p className="text-sm text-muted-foreground">Games Played</p>
            </Card>

            <Card className="card-casino p-6 text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-3xl font-bold mb-1">{stats.totalWagered.toFixed(2)}</h3>
              <p className="text-sm text-muted-foreground">Total Wagered</p>
            </Card>

            <Card className="card-casino p-6 text-center">
              <TrendingDown className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className={`text-3xl font-bold mb-1 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
              </h3>
              <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
            </Card>

            <Card className="card-casino p-6 text-center">
              <User className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="text-3xl font-bold mb-1">{stats.winRate.toFixed(1)}%</h3>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </Card>
          </div>

          <Card className="card-casino p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              Game History
            </h2>

            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No games played yet</p>
                <Button onClick={() => navigate('/')}>
                  Start Playing
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((game) => (
                  <div
                    key={game.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      game.result ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <div>
                      <p className="font-medium capitalize">{game.game_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Bet: {game.bet_amount} USDC
                      </p>
                      <p className={`text-sm ${game.result ? 'text-green-500' : 'text-red-500'}`}>
                        {game.result ? `+${game.win_amount}` : `-${game.bet_amount}`} USDC
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
