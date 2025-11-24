import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Clock, Users, Coins, Target, Loader2, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Tournament {
  id: string;
  name: string;
  description: string;
  game_type: string;
  entry_fee: number;
  prize_pool: number;
  max_participants: number;
  start_time: string;
  end_time: string;
  status: string;
}

interface TournamentEntry {
  wallet_address: string;
  username: string | null;
  total_score: number;
  games_played: number;
  best_multiplier: number;
  total_wagered: number;
  total_won: number;
  joined_at: string;
}

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useWeb3();
  const { toast } = useToast();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [userEntry, setUserEntry] = useState<TournamentEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
      loadTournamentData();

      // Real-time updates for leaderboard
      const channel = supabase
        .channel(`tournament-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tournament_entries',
            filter: `tournament_id=eq.${id}`
          },
          () => {
            loadLeaderboard();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id]);

  const loadTournamentData = async () => {
    if (!id) return;

    try {
      const { data: tournamentData, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTournament(tournamentData);

      await loadLeaderboard();
    } catch (error) {
      console.error('Error loading tournament:', error);
      toast({
        title: "Error",
        description: "Failed to load tournament data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!id) return;

    try {
      const { data: entriesData } = await supabase
        .from('tournament_entries')
        .select('*')
        .eq('tournament_id', id)
        .order('total_score', { ascending: false });

      setEntries(entriesData || []);

      if (account) {
        const userEntryData = entriesData?.find(e => e.wallet_address.toLowerCase() === account.toLowerCase());
        setUserEntry(userEntryData || null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleJoinTournament = async () => {
    if (!account || !tournament) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to join",
        variant: "destructive",
      });
      return;
    }

    if (tournament.status !== 'active' && tournament.status !== 'upcoming') {
      toast({
        title: "Tournament Unavailable",
        description: "This tournament is no longer accepting entries",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      const { error } = await supabase
        .from('tournament_entries')
        .insert({
          tournament_id: tournament.id,
          wallet_address: account,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Joined",
            description: "You're already in this tournament!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Joined Successfully!",
          description: `You've entered the tournament. Entry fee: ${tournament.entry_fee} USDC`,
        });
        await loadLeaderboard();
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Error",
        description: "Failed to join tournament",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const handlePlayGame = () => {
    if (!tournament) return;
    navigate(`/game/${tournament.game_type}?tournament=${tournament.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Tournament Not Found</h2>
          <Button onClick={() => navigate('/tournaments')}>Back to Tournaments</Button>
        </div>
      </div>
    );
  }

  const getTimeDisplay = () => {
    const now = new Date();
    const start = new Date(tournament.start_time);
    const end = new Date(tournament.end_time);

    if (tournament.status === 'active') {
      return `Ends ${formatDistanceToNow(end, { addSuffix: true })}`;
    } else if (tournament.status === 'upcoming') {
      return `Starts ${formatDistanceToNow(start, { addSuffix: true })}`;
    } else {
      return 'Tournament Ended';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/tournaments')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tournament Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-casino p-6">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-10 h-10 text-primary" />
                <h1 className="text-2xl font-bold">{tournament.name}</h1>
              </div>
              <p className="text-muted-foreground mb-6">{tournament.description}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Prize Pool
                  </span>
                  <span className="font-bold text-primary text-lg">{tournament.prize_pool} USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Entry Fee
                  </span>
                  <span className="font-bold">{tournament.entry_fee} USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Players
                  </span>
                  <span className="font-bold">{entries.length}/{tournament.max_participants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                  </span>
                  <span className="font-bold">{getTimeDisplay()}</span>
                </div>
              </div>

              {!userEntry ? (
                <Button
                  onClick={handleJoinTournament}
                  disabled={joining || tournament.status === 'completed'}
                  className="w-full btn-casino"
                >
                  {joining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : tournament.status === 'completed' ? (
                    'Tournament Ended'
                  ) : (
                    `Join Tournament (${tournament.entry_fee} USDC)`
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                    <p className="text-green-500 font-bold text-center">✓ You're In!</p>
                  </div>
                  {tournament.status === 'active' && (
                    <Button onClick={handlePlayGame} className="w-full btn-casino">
                      Play Tournament Game
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {userEntry && (
              <Card className="card-casino p-6">
                <h3 className="text-lg font-bold mb-4">Your Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-bold">{userEntry.total_score.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Games</span>
                    <span className="font-bold">{userEntry.games_played}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Multiplier</span>
                    <span className="font-bold">{userEntry.best_multiplier}x</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="card-casino p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Leaderboard
              </h2>

              {entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No participants yet. Be the first to join!
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.wallet_address}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        entry.wallet_address.toLowerCase() === account?.toLowerCase()
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted/20'
                      }`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-lg">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Trophy className="w-5 h-5 text-amber-700" />}
                        {index > 2 && <span>#{index + 1}</span>}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {entry.username || `${entry.wallet_address.slice(0, 6)}...${entry.wallet_address.slice(-4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.games_played} games • {entry.best_multiplier}x best
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{entry.total_score.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">score</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TournamentDetail;
