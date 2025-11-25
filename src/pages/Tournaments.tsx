import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Users, Coins, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAutoFinalizeTournaments } from "@/hooks/useAutoFinalizeTournaments";

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
  participant_count?: number;
}

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auto-finalize tournaments that have ended
  useAutoFinalizeTournaments();

  useEffect(() => {
    loadTournaments();

    // Real-time updates
    const channel = supabase
      .channel('tournaments-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        () => {
          loadTournaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTournaments = async () => {
    try {
      const { data: tournamentData, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Get participant counts
      const tournamentsWithCounts = await Promise.all(
        (tournamentData || []).map(async (tournament) => {
          const { count } = await supabase
            .from('tournament_entries')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', tournament.id);

          return {
            ...tournament,
            participant_count: count || 0,
          };
        })
      );

      setTournaments(tournamentsWithCounts);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500 border-green-500';
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-500 border-blue-500';
      case 'completed':
        return 'bg-gray-500/20 text-gray-500 border-gray-500';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  const getTimeDisplay = (tournament: Tournament) => {
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

  const groupedTournaments = {
    active: tournaments.filter(t => t.status === 'active'),
    upcoming: tournaments.filter(t => t.status === 'upcoming'),
    completed: tournaments.filter(t => t.status === 'completed'),
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-black mb-2 text-gradient-red glow-red flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12" />
            Tournaments
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete for massive prizes in time-limited tournaments
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tournaments */}
            {groupedTournaments.active.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Active Now
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTournaments.active.map((tournament) => (
                    <Card
                      key={tournament.id}
                      className="card-casino p-6 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/tournament/${tournament.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Trophy className="w-8 h-8 text-primary" />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tournament.status)}`}>
                          {tournament.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {tournament.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            Prize Pool
                          </span>
                          <span className="font-bold text-primary">{tournament.prize_pool} USDC</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Players
                          </span>
                          <span className="font-bold">{tournament.participant_count}/{tournament.max_participants}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Time
                          </span>
                          <span className="font-bold">{getTimeDisplay(tournament)}</span>
                        </div>
                      </div>

                      <Button className="w-full btn-casino">
                        Join Tournament ({tournament.entry_fee} USDC)
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tournaments */}
            {groupedTournaments.upcoming.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Upcoming</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTournaments.upcoming.map((tournament) => (
                    <Card
                      key={tournament.id}
                      className="card-casino p-6 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/tournament/${tournament.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Trophy className="w-8 h-8 text-primary" />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tournament.status)}`}>
                          {tournament.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {tournament.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            Prize Pool
                          </span>
                          <span className="font-bold text-primary">{tournament.prize_pool} USDC</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Starts
                          </span>
                          <span className="font-bold">{getTimeDisplay(tournament)}</span>
                        </div>
                      </div>

                      <Button className="w-full btn-casino" disabled>
                        Starts Soon
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tournaments */}
            {groupedTournaments.completed.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTournaments.completed.map((tournament) => (
                    <Card
                      key={tournament.id}
                      className="card-casino p-6 opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => navigate(`/tournament/${tournament.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Trophy className="w-8 h-8 text-muted-foreground" />
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(tournament.status)}`}>
                          ENDED
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{tournament.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Prize: {tournament.prize_pool} USDC
                      </p>

                      <Button variant="outline" className="w-full">
                        View Results
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tournaments;
