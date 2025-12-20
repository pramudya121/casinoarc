import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/contexts/Web3Context";
import { 
  Shield, 
  Users, 
  TrendingUp, 
  Settings, 
  DollarSign, 
  Gamepad2,
  Trophy,
  Activity,
  BarChart3,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

// Admin wallet addresses (can be expanded)
const ADMIN_WALLETS = [
  "0x0000000000000000000000000000000000000000", // Replace with actual admin wallet
];

interface DashboardStats {
  totalPlayers: number;
  totalGamesPlayed: number;
  totalWagered: number;
  totalPayout: number;
  activeTournaments: number;
  houseProfit: number;
}

interface GameSetting {
  id: string;
  game_name: string;
  enabled: boolean;
  min_bet: number;
  max_bet: number;
  house_edge: number;
  rtp: number;
}

export default function Admin() {
  const { account } = useWeb3();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalGamesPlayed: 0,
    totalWagered: 0,
    totalPayout: 0,
    activeTournaments: 0,
    houseProfit: 0,
  });
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([]);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);

  useEffect(() => {
    // For demo purposes, allow any connected wallet to access admin
    // In production, replace with proper admin check
    if (account) {
      setIsAdmin(true);
      fetchDashboardData();
    }
  }, [account]);

  const fetchDashboardData = async () => {
    try {
      // Fetch total players
      const { count: playerCount } = await supabase
        .from('leaderboard_casino')
        .select('*', { count: 'exact', head: true });

      // Fetch total games
      const { count: gameCount } = await supabase
        .from('game_history')
        .select('*', { count: 'exact', head: true });

      // Fetch wagering stats
      const { data: wagerData } = await supabase
        .from('game_history')
        .select('bet_amount, win_amount, result');

      let totalWagered = 0;
      let totalPayout = 0;
      if (wagerData) {
        wagerData.forEach(game => {
          totalWagered += game.bet_amount || 0;
          totalPayout += game.win_amount || 0;
        });
      }

      // Fetch active tournaments
      const { count: tournamentCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalPlayers: playerCount || 0,
        totalGamesPlayed: gameCount || 0,
        totalWagered,
        totalPayout,
        activeTournaments: tournamentCount || 0,
        houseProfit: totalWagered - totalPayout,
      });

      // Fetch game settings
      const { data: settings } = await supabase
        .from('game_settings')
        .select('*');
      
      if (settings) {
        setGameSettings(settings);
      }

      // Fetch recent games
      const { data: recent } = await supabase
        .from('game_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recent) {
        setRecentGames(recent);
      }

      // Fetch top players
      const { data: top } = await supabase
        .from('leaderboard_casino')
        .select('*')
        .order('total_wagered', { ascending: false })
        .limit(10);
      
      if (top) {
        setTopPlayers(top);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const updateGameSetting = async (id: string, field: string, value: any) => {
    try {
      await supabase
        .from('game_settings')
        .update({ [field]: value })
        .eq('id', id);
      
      toast({
        title: "Settings Updated",
        description: "Game settings have been saved",
      });
      
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground">
              Please connect your wallet to access the admin dashboard.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              Your wallet does not have admin privileges.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Players", value: stats.totalPlayers, color: "text-blue-500" },
    { icon: Gamepad2, label: "Games Played", value: stats.totalGamesPlayed, color: "text-purple-500" },
    { icon: DollarSign, label: "Total Wagered", value: `${stats.totalWagered.toFixed(2)} USDC`, color: "text-green-500" },
    { icon: TrendingUp, label: "Total Payouts", value: `${stats.totalPayout.toFixed(2)} USDC`, color: "text-yellow-500" },
    { icon: Trophy, label: "Active Tournaments", value: stats.activeTournaments, color: "text-orange-500" },
    { icon: BarChart3, label: "House Profit", value: `${stats.houseProfit.toFixed(2)} USDC`, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-black text-gradient-red">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage your casino platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-casino p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-muted/20 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="bg-muted/20 border border-border">
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-primary">
              <Users className="w-4 h-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary">
              <Settings className="w-4 h-4 mr-2" />
              Game Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="card-casino p-6">
              <h3 className="text-xl font-bold mb-4">Recent Game Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Player</th>
                      <th className="text-left py-3 px-4">Game</th>
                      <th className="text-left py-3 px-4">Bet</th>
                      <th className="text-left py-3 px-4">Result</th>
                      <th className="text-left py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames.map((game, index) => (
                      <motion.tr
                        key={game.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/10"
                      >
                        <td className="py-3 px-4 font-mono text-sm">
                          {game.wallet_address.slice(0, 6)}...{game.wallet_address.slice(-4)}
                        </td>
                        <td className="py-3 px-4">{game.game_name}</td>
                        <td className="py-3 px-4">{game.bet_amount} USDC</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${game.result ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {game.result ? `Won ${game.win_amount}` : 'Lost'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(game.created_at).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                    {recentGames.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No recent games
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="players">
            <Card className="card-casino p-6">
              <h3 className="text-xl font-bold mb-4">Top Players by Wagered Amount</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-left py-3 px-4">Player</th>
                      <th className="text-left py-3 px-4">Username</th>
                      <th className="text-left py-3 px-4">Total Wagered</th>
                      <th className="text-left py-3 px-4">Total Wins</th>
                      <th className="text-left py-3 px-4">Biggest Win</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPlayers.map((player, index) => (
                      <motion.tr
                        key={player.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/10"
                      >
                        <td className="py-3 px-4">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-muted'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">
                          {player.wallet_address.slice(0, 6)}...{player.wallet_address.slice(-4)}
                        </td>
                        <td className="py-3 px-4">{player.username || 'Anonymous'}</td>
                        <td className="py-3 px-4 font-bold">{player.total_wagered?.toFixed(2)} USDC</td>
                        <td className="py-3 px-4 text-green-500">{player.total_wins}</td>
                        <td className="py-3 px-4 text-primary">{player.biggest_win?.toFixed(2)} USDC</td>
                      </motion.tr>
                    ))}
                    {topPlayers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No players yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="card-casino p-6">
              <h3 className="text-xl font-bold mb-4">Game Configuration</h3>
              <div className="space-y-4">
                {gameSettings.map((game) => (
                  <div key={game.id} className="p-4 bg-muted/10 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="w-5 h-5 text-primary" />
                        <span className="font-bold text-lg">{game.game_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Enabled</span>
                        <Switch
                          checked={game.enabled}
                          onCheckedChange={(checked) => updateGameSetting(game.id, 'enabled', checked)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Min Bet (USDC)</label>
                        <Input
                          type="number"
                          value={game.min_bet}
                          onChange={(e) => updateGameSetting(game.id, 'min_bet', parseFloat(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Max Bet (USDC)</label>
                        <Input
                          type="number"
                          value={game.max_bet}
                          onChange={(e) => updateGameSetting(game.id, 'max_bet', parseFloat(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">House Edge (%)</label>
                        <Input
                          type="number"
                          value={game.house_edge}
                          onChange={(e) => updateGameSetting(game.id, 'house_edge', parseFloat(e.target.value))}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">RTP (%)</label>
                        <Input
                          type="number"
                          value={game.rtp}
                          onChange={(e) => updateGameSetting(game.id, 'rtp', parseFloat(e.target.value))}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {gameSettings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No game settings configured yet.</p>
                    <p className="text-sm">Game settings will appear here once games are played.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
