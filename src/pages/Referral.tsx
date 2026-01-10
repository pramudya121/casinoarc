import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/contexts/Web3Context";
import { useReferralSystem } from "@/hooks/useReferralSystem";
import { Users, Gift, Copy, Check, DollarSign, TrendingUp, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface ReferralCode {
  id: string;
  wallet_address: string;
  referral_code: string;
  total_referrals: number;
  total_commission: number;
  commission_rate: number;
}

interface Referral {
  id: string;
  referred_address: string;
  commission_earned: number;
  commission_claimed: number;
  games_by_referred: number;
  created_at: string;
}

export default function Referral() {
  const { account } = useWeb3();
  const { getOrCreateReferralCode, applyReferralCode, claimCommission } = useReferralSystem();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAppliedCode, setHasAppliedCode] = useState(false);

  useEffect(() => {
    if (account) {
      fetchReferralData();
    }
  }, [account]);

  const fetchReferralData = async () => {
    if (!account) return;

    // Get or create referral code
    const code = await getOrCreateReferralCode(account);
    setReferralCode(code);

    // Fetch referrals made by this user
    const { data: myReferrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_address', account)
      .order('created_at', { ascending: false });

    if (myReferrals) {
      setReferrals(myReferrals);
    }

    // Check if user has used a referral code
    const { data: appliedReferral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_address', account)
      .maybeSingle();

    setHasAppliedCode(!!appliedReferral);
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const copyReferralLink = () => {
    if (referralCode) {
      const link = `${window.location.origin}?ref=${referralCode.referral_code}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const handleApplyCode = async () => {
    if (!account || !inputCode) return;
    
    setLoading(true);
    const result = await applyReferralCode(account, inputCode);
    
    toast({
      title: result.success ? "Success!" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      setHasAppliedCode(true);
      setInputCode("");
    }
    
    setLoading(false);
  };

  const handleClaimCommission = async () => {
    if (!account) return;
    
    setLoading(true);
    const result = await claimCommission(account);
    
    toast({
      title: result.success ? "🎉 Success!" : "Info",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      fetchReferralData();
    }
    
    setLoading(false);
  };

  const getUnclaimedCommission = () => {
    return referrals.reduce((total, ref) => {
      return total + (ref.commission_earned - ref.commission_claimed);
    }, 0);
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
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4"
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-gradient-red glow-red mb-2">Referral Program</h1>
            <p className="text-muted-foreground">Invite friends and earn 5% commission on their bets!</p>
          </div>

          {!account ? (
            <Card className="card-casino p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Connect Wallet</h2>
              <p className="text-muted-foreground">Connect your wallet to access the referral program</p>
            </Card>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="card-casino p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20 text-green-500">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Referrals</p>
                        <p className="text-2xl font-bold">{referralCode?.total_referrals || 0}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="card-casino p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-500">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Earned</p>
                        <p className="text-2xl font-bold">{(referralCode?.total_commission || 0).toFixed(4)}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="card-casino p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/20 text-primary">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unclaimed</p>
                        <p className="text-2xl font-bold">{getUnclaimedCommission().toFixed(4)}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="card-casino p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20 text-purple-500">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission Rate</p>
                        <p className="text-2xl font-bold">{referralCode?.commission_rate || 5}%</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Your Referral Code */}
                <Card className="card-casino p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-primary" />
                    Your Referral Code
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 bg-muted/20 p-4 rounded-lg text-center">
                        <p className="text-3xl font-black tracking-wider text-primary">
                          {referralCode?.referral_code || "Loading..."}
                        </p>
                      </div>
                      <Button
                        onClick={copyReferralCode}
                        variant="outline"
                        className="px-4"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                    <Button onClick={copyReferralLink} className="w-full btn-casino">
                      <Share2 className="w-4 h-4 mr-2" />
                      Copy Referral Link
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Share this code with friends to earn 5% of their bets!
                    </p>
                  </div>
                </Card>

                {/* Apply Referral Code */}
                <Card className="card-casino p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-yellow-500" />
                    Enter Referral Code
                  </h3>
                  {hasAppliedCode ? (
                    <div className="text-center py-8">
                      <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-bold text-green-500">Referral Code Applied!</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        You've already used a referral code
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter referral code"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        className="text-center text-lg tracking-wider"
                      />
                      <Button
                        onClick={handleApplyCode}
                        disabled={loading || !inputCode}
                        className="w-full btn-casino"
                      >
                        Apply Code
                      </Button>
                      <p className="text-sm text-muted-foreground text-center">
                        Enter a friend's referral code to support them
                      </p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Claim Commission */}
              {getUnclaimedCommission() > 0 && (
                <Card className="card-casino p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/20 text-primary">
                        <Gift className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">Unclaimed Commissions</p>
                        <p className="text-2xl font-black text-primary">
                          {getUnclaimedCommission().toFixed(4)} USDC
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleClaimCommission}
                      disabled={loading}
                      className="btn-casino px-8"
                    >
                      Claim Now
                    </Button>
                  </div>
                </Card>
              )}

              {/* Referral List */}
              <Card className="card-casino p-6">
                <h3 className="text-xl font-bold mb-4">Your Referrals</h3>
                {referrals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4">Referred User</th>
                          <th className="text-left py-3 px-4">Games Played</th>
                          <th className="text-left py-3 px-4">Commission Earned</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.map((referral, index) => (
                          <motion.tr
                            key={referral.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-border/50 hover:bg-muted/10"
                          >
                            <td className="py-3 px-4 font-mono text-sm">
                              {referral.referred_address.slice(0, 6)}...{referral.referred_address.slice(-4)}
                            </td>
                            <td className="py-3 px-4">{referral.games_by_referred}</td>
                            <td className="py-3 px-4 font-bold text-primary">
                              {referral.commission_earned.toFixed(4)} USDC
                            </td>
                            <td className="py-3 px-4">
                              {referral.commission_earned > referral.commission_claimed ? (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">
                                  Pending
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">
                                  Claimed
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(referral.created_at).toLocaleDateString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No referrals yet. Share your code to start earning!</p>
                  </div>
                )}
              </Card>

              {/* How It Works */}
              <Card className="card-casino p-6 mt-8">
                <h3 className="text-xl font-bold mb-4">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-black text-primary">1</span>
                    </div>
                    <h4 className="font-bold mb-2">Share Your Code</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your unique referral code or link with friends
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-black text-primary">2</span>
                    </div>
                    <h4 className="font-bold mb-2">Friends Play</h4>
                    <p className="text-sm text-muted-foreground">
                      When your friends play games, you earn commission
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-black text-primary">3</span>
                    </div>
                    <h4 className="font-bold mb-2">Claim Rewards</h4>
                    <p className="text-sm text-muted-foreground">
                      Claim your commissions anytime - 5% of all their bets!
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
