import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/contexts/Web3Context";
import { format } from "date-fns";
import { ExternalLink, Clock, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  game_name: string;
  bet_amount: number;
  win_amount: number | null;
  result: boolean;
  tx_hash: string | null;
  created_at: string;
}

const TransactionHistory = () => {
  const { account } = useWeb3();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (account) {
      fetchTransactions();
    }
  }, [account]);

  const fetchTransactions = async () => {
    if (!account) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('game_history')
      .select('*')
      .eq('wallet_address', account)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const getStatusIcon = (result: boolean) => {
    return result ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black mb-2 text-gradient-red glow-red">
              Transaction History
            </h1>
            <p className="text-muted-foreground mb-8">
              View all your blockchain transactions
            </p>

            {!account ? (
              <Card className="card-casino p-8 text-center">
                <p className="text-muted-foreground">
                  Connect your wallet to view transaction history
                </p>
              </Card>
            ) : loading ? (
              <Card className="card-casino p-8">
                <div className="flex items-center justify-center">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  <p>Loading transactions...</p>
                </div>
              </Card>
            ) : transactions.length === 0 ? (
              <Card className="card-casino p-8 text-center">
                <p className="text-muted-foreground">
                  No transactions found. Start playing to see your history!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="card-casino p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(tx.result)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg capitalize">
                                {tx.game_name}
                              </h3>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                tx.result ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                              }`}>
                                {tx.result ? 'WIN' : 'LOSS'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(tx.created_at), 'PPpp')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Bet: {tx.bet_amount.toFixed(4)} USDC
                            </p>
                            {tx.result && tx.win_amount && (
                              <p className="text-sm font-bold text-green-500">
                                Won: +{tx.win_amount.toFixed(4)} USDC
                              </p>
                            )}
                            {!tx.result && (
                              <p className="text-sm font-bold text-red-500">
                                Lost: -{tx.bet_amount.toFixed(4)} USDC
                              </p>
                            )}
                          </div>
                          
                          {tx.tx_hash && (
                            <a
                              href={`https://testnet.arcscan.app/tx/${tx.tx_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                            >
                              View on Explorer
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TransactionHistory;
