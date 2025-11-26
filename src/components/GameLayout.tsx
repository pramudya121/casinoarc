import { ReactNode } from "react";
import { Header } from "./Header";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trophy } from "lucide-react";
import { useTournamentMode } from "@/hooks/useTournamentMode";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { celebrateWin, celebrateBigWin } from "@/lib/confetti";
import { motion, AnimatePresence } from "framer-motion";

interface GameLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  onPlay: (betAmount: string) => Promise<{ win: boolean; tx: any }>;
  gameName: string;
}

export const GameLayout = ({ title, description, children, onPlay, gameName }: GameLayoutProps) => {
  const { account, casinoGamesContract, updateBalance } = useWeb3();
  const [betAmount, setBetAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ win: boolean; amount: string } | null>(null);
  const { isTournamentMode, tournamentId } = useTournamentMode();
  const { playWinSound, playLoseSound, playClickSound } = useSoundEffects();

  const handlePlay = async () => {
    if (!account || !casinoGamesContract) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to play",
        variant: "destructive",
      });
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const loadingToast = toast({
      title: "Transaction Pending",
      description: "Please confirm the transaction in your wallet...",
    });

    try {
      const result = await onPlay(betAmount);
      
      // Wait for transaction to be mined
      toast({
        title: "Processing",
        description: "Waiting for blockchain confirmation...",
      });
      
      await result.tx.wait();
      
      // Update balance after transaction
      await updateBalance();
      
      const winAmount = result.win ? parseFloat(betAmount) * 2 : 0;
      const profit = result.win ? winAmount - parseFloat(betAmount) : -parseFloat(betAmount);
      setLastResult({ win: result.win, amount: betAmount });

      // Record game history
      await supabase.from('game_history').insert({
        wallet_address: account,
        game_name: gameName,
        bet_amount: parseFloat(betAmount),
        win_amount: winAmount,
        result: result.win,
        tx_hash: result.tx.hash,
      });

      // Update casino leaderboard
      const { data: casinoData } = await supabase
        .from('leaderboard_casino')
        .select('*')
        .eq('wallet_address', account)
        .single();

      if (casinoData) {
        await supabase
          .from('leaderboard_casino')
          .update({
            total_wagered: casinoData.total_wagered + parseFloat(betAmount),
            total_wins: casinoData.total_wins + (result.win ? 1 : 0),
            biggest_win: Math.max(casinoData.biggest_win, winAmount),
            last_updated: new Date().toISOString(),
          })
          .eq('wallet_address', account);
      } else {
        await supabase
          .from('leaderboard_casino')
          .insert({
            wallet_address: account,
            total_wagered: parseFloat(betAmount),
            total_wins: result.win ? 1 : 0,
            biggest_win: winAmount,
          });
      }

      // Update trader leaderboard
      const { data: traderData } = await supabase
        .from('leaderboard_trader')
        .select('*')
        .eq('wallet_address', account)
        .single();

      if (traderData) {
        const newGamesPlayed = traderData.games_played + 1;
        const newTotalProfit = traderData.total_profit + profit;
        const newWins = result.win ? 1 : 0;
        const currentWins = Math.round((traderData.win_rate / 100) * traderData.games_played);
        const newWinRate = ((currentWins + newWins) / newGamesPlayed) * 100;

        await supabase
          .from('leaderboard_trader')
          .update({
            games_played: newGamesPlayed,
            total_profit: newTotalProfit,
            win_rate: newWinRate,
            last_updated: new Date().toISOString(),
          })
          .eq('wallet_address', account);
      } else {
        await supabase
          .from('leaderboard_trader')
          .insert({
            wallet_address: account,
            games_played: 1,
            total_profit: profit,
            win_rate: result.win ? 100 : 0,
          });
      }

      // Update tournament entry if in tournament mode
      if (isTournamentMode && tournamentId) {
        const { data: tournamentEntry } = await supabase
          .from('tournament_entries')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('wallet_address', account)
          .single();

        if (tournamentEntry) {
          const multiplier = result.win ? 2 : 0;
          const score = tournamentEntry.total_score + (multiplier * parseFloat(betAmount));
          
          await supabase
            .from('tournament_entries')
            .update({
              total_score: score,
              games_played: tournamentEntry.games_played + 1,
              best_multiplier: Math.max(tournamentEntry.best_multiplier, multiplier),
              total_wagered: tournamentEntry.total_wagered + parseFloat(betAmount),
              total_won: tournamentEntry.total_won + winAmount,
            })
            .eq('tournament_id', tournamentId)
            .eq('wallet_address', account);
        }
      }

      // Show result toast with sound and confetti
      if (result.win) {
        playWinSound();
        const isBigWin = winAmount > parseFloat(betAmount) * 5;
        if (isBigWin) {
          celebrateBigWin();
        } else {
          celebrateWin();
        }
        toast({
          title: "🎉 You Won!",
          description: `Congratulations! You won ${winAmount.toFixed(4)} USDC`,
        });
      } else {
        playLoseSound();
        toast({
          title: "Better Luck Next Time",
          description: `You lost ${betAmount} USDC`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Game error:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to play game",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black mb-2 text-gradient-red glow-red">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
            {isTournamentMode && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary rounded-lg">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-bold text-primary">Tournament Mode Active</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="card-casino p-6">
                {children}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="card-casino p-6">
                <h3 className="text-xl font-bold mb-4">Place Your Bet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Bet Amount (USDC)
                    </label>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      placeholder="0.01"
                      className="text-lg"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      playClickSound();
                      handlePlay();
                    }}
                    disabled={loading || !account}
                    className="w-full btn-casino h-12 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Playing...
                      </>
                    ) : (
                      'Play Now'
                    )}
                  </Button>
                </div>
              </Card>

              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    <Card className={`card-casino p-6 ${lastResult.win ? 'border-green-500 shadow-green-500/50' : 'border-red-500 shadow-red-500/50'} shadow-lg`}>
                      <motion.h3 
                        className="text-xl font-bold mb-2"
                        animate={lastResult.win ? { scale: [1, 1.1, 1] } : { x: [-10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        {lastResult.win ? '🎉 Winner!' : '😔 Lost'}
                      </motion.h3>
                      <p className="text-muted-foreground">
                        Bet: {lastResult.amount} USDC<br/>
                        {lastResult.win ? `Won: ${(parseFloat(lastResult.amount) * 2).toFixed(4)} USDC` : 'Better luck next time!'}
                      </p>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="card-casino p-6">
                <h3 className="text-lg font-bold mb-2">Game Info</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="text-foreground">ARC Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Edge:</span>
                    <span className="text-foreground">2.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Bet:</span>
                    <span className="text-foreground">0.01 USDC</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
