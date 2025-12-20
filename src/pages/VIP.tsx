import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/contexts/Web3Context";
import { Crown, Gift, Star, TrendingUp, Zap, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  min_wagered: number;
  cashback_rate: number;
  bonus_multiplier: number;
  icon: string;
  color: string;
}

interface UserVIP {
  id: string;
  wallet_address: string;
  current_level: number;
  total_wagered: number;
  cashback_earned: number;
  cashback_claimed: number;
}

export default function VIP() {
  const { account } = useWeb3();
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [userVip, setUserVip] = useState<UserVIP | null>(null);
  const [currentLevelInfo, setCurrentLevelInfo] = useState<VIPLevel | null>(null);
  const [nextLevelInfo, setNextLevelInfo] = useState<VIPLevel | null>(null);

  useEffect(() => {
    fetchVIPData();
  }, [account]);

  const fetchVIPData = async () => {
    // Fetch all VIP levels
    const { data: levels } = await supabase
      .from('vip_levels')
      .select('*')
      .order('level', { ascending: true });
    
    if (levels) {
      setVipLevels(levels);
    }

    if (account) {
      // Fetch user's VIP status
      const { data: userVipData } = await supabase
        .from('user_vip')
        .select('*')
        .eq('wallet_address', account)
        .maybeSingle();

      if (userVipData) {
        setUserVip(userVipData);
        
        // Set current and next level info
        const current = levels?.find(l => l.level === userVipData.current_level);
        const next = levels?.find(l => l.level === userVipData.current_level + 1);
        setCurrentLevelInfo(current || null);
        setNextLevelInfo(next || null);
      } else {
        // Create initial VIP record
        const { data: newVip } = await supabase
          .from('user_vip')
          .insert({
            wallet_address: account,
            current_level: 1,
            total_wagered: 0,
            cashback_earned: 0,
            cashback_claimed: 0,
          })
          .select()
          .single();
        
        if (newVip) {
          setUserVip(newVip);
          const current = levels?.find(l => l.level === 1);
          const next = levels?.find(l => l.level === 2);
          setCurrentLevelInfo(current || null);
          setNextLevelInfo(next || null);
        }
      }
    }
  };

  const claimCashback = async () => {
    if (!userVip || !account) return;

    const unclaimedCashback = userVip.cashback_earned - userVip.cashback_claimed;
    if (unclaimedCashback <= 0) {
      toast({
        title: "No Cashback Available",
        description: "Play more games to earn cashback rewards!",
        variant: "destructive",
      });
      return;
    }

    await supabase
      .from('user_vip')
      .update({
        cashback_claimed: userVip.cashback_earned,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', account);

    toast({
      title: "🎉 Cashback Claimed!",
      description: `You claimed ${unclaimedCashback.toFixed(4)} USDC cashback!`,
    });

    fetchVIPData();
  };

  const getProgressToNextLevel = () => {
    if (!userVip || !nextLevelInfo || !currentLevelInfo) return 100;
    const progress = ((userVip.total_wagered - currentLevelInfo.min_wagered) / 
                      (nextLevelInfo.min_wagered - currentLevelInfo.min_wagered)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getUnclaimedCashback = () => {
    if (!userVip) return 0;
    return userVip.cashback_earned - userVip.cashback_claimed;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 mb-4"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-gradient-red glow-red mb-2">VIP Rewards</h1>
            <p className="text-muted-foreground">Level up and earn exclusive rewards</p>
          </div>

          {/* Current Status */}
          {account && userVip && currentLevelInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="card-casino p-6 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="text-6xl">{currentLevelInfo.icon}</div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <h2 className="text-2xl font-bold">{currentLevelInfo.name}</h2>
                      <span className="px-2 py-1 bg-primary/20 rounded text-xs font-bold">
                        Level {currentLevelInfo.level}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      Total Wagered: {userVip.total_wagered.toFixed(2)} USDC
                    </p>
                    
                    {nextLevelInfo && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress to {nextLevelInfo.name}</span>
                          <span>{getProgressToNextLevel().toFixed(0)}%</span>
                        </div>
                        <Progress value={getProgressToNextLevel()} className="h-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {(nextLevelInfo.min_wagered - userVip.total_wagered).toFixed(2)} USDC more to reach {nextLevelInfo.name}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <Card className="p-4 bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-1">Available Cashback</p>
                      <p className="text-2xl font-bold text-primary">{getUnclaimedCashback().toFixed(4)} USDC</p>
                      <Button 
                        onClick={claimCashback}
                        disabled={getUnclaimedCashback() <= 0}
                        className="mt-3 w-full btn-casino"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Claim
                      </Button>
                    </Card>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {!account && (
            <Card className="card-casino p-8 text-center mb-8">
              <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
              <p className="text-muted-foreground">Connect your wallet to view your VIP status</p>
            </Card>
          )}

          {/* VIP Levels */}
          <h2 className="text-2xl font-bold mb-6 text-center">VIP Levels & Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vipLevels.map((level, index) => {
              const isCurrentLevel = userVip?.current_level === level.level;
              const isUnlocked = userVip && userVip.current_level >= level.level;
              
              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`card-casino p-6 relative overflow-hidden transition-all duration-300
                      ${isCurrentLevel ? 'border-primary border-2 shadow-lg shadow-primary/30' : ''}
                      ${!isUnlocked ? 'opacity-60' : ''}
                    `}
                  >
                    {isCurrentLevel && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-bold animate-pulse">
                          Current
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <motion.div 
                        className="text-5xl mb-2"
                        animate={isCurrentLevel ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {level.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold" style={{ color: level.color }}>
                        {level.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Level {level.level}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Wager Required:</span>
                        <span className="ml-auto font-bold">{level.min_wagered} USDC</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Gift className="w-4 h-4 text-yellow-500" />
                        <span>Cashback Rate:</span>
                        <span className="ml-auto font-bold text-yellow-500">{level.cashback_rate}%</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span>Bonus Multiplier:</span>
                        <span className="ml-auto font-bold text-purple-500">{level.bonus_multiplier}x</span>
                      </div>
                    </div>
                    
                    {!isUnlocked && (
                      <div className="mt-4 text-center">
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Award className="w-3 h-3" />
                          Wager {level.min_wagered - (userVip?.total_wagered || 0)} more to unlock
                        </span>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Benefits Info */}
          <Card className="card-casino p-6 mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              How VIP Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold mb-2">Play & Wager</h4>
                <p className="text-sm text-muted-foreground">
                  Every bet you place counts towards your VIP progress. Wager more to level up faster!
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-yellow-500" />
                </div>
                <h4 className="font-bold mb-2">Earn Cashback</h4>
                <p className="text-sm text-muted-foreground">
                  Earn cashback on all your bets based on your VIP level. Higher levels = better rates!
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="font-bold mb-2">Bonus Multipliers</h4>
                <p className="text-sm text-muted-foreground">
                  Get bonus multipliers on your winnings. Royal members get 2x bonus on all wins!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
