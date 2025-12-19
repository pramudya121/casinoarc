import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const Baccarat = () => {
  const [bet, setBet] = useState<number>(0);
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [bankerCards, setBankerCards] = useState<string[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const { casinoGamesContract } = useWeb3();
  const { playCoinSound, playClickSound } = useSoundEffects();

  const generateCard = () => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return `${value}${suit}`;
  };

  const isRedSuit = (card: string) => card.includes('♥') || card.includes('♦');

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setPlayerCards([]);
    setBankerCards([]);
    setWinner(null);
    setIsDealing(true);
    playClickSound();

    const tx = await casinoGamesContract.playBaccarat(bet, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    // Deal cards with animation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setPlayerCards([generateCard()]);
    playCoinSound();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setBankerCards([generateCard()]);
    playCoinSound();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setPlayerCards(prev => [...prev, generateCard()]);
    playCoinSound();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setBankerCards(prev => [...prev, generateCard()]);
    playCoinSound();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    // Set winner based on bet
    const results = ['Player', 'Banker', 'Tie'];
    setWinner(win ? options[bet].name : results[Math.floor(Math.random() * 2)]);
    setIsDealing(false);

    return { win, tx };
  };

  const options = [
    { id: 0, name: 'Player', payout: '1:1', color: 'from-blue-500 to-blue-600', icon: '👤' },
    { id: 1, name: 'Banker', payout: '0.95:1', color: 'from-red-500 to-red-600', icon: '🏦' },
    { id: 2, name: 'Tie', payout: '8:1', color: 'from-green-500 to-green-600', icon: '🤝' },
  ];

  const CardComponent = ({ card, index, delay }: { card: string; index: number; delay: number }) => (
    <motion.div
      initial={{ opacity: 0, rotateY: 180, y: -50 }}
      animate={{ opacity: 1, rotateY: 0, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring" }}
      className={`w-16 h-24 sm:w-20 sm:h-28 bg-white rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-bold border-2 border-gray-200 shadow-lg ${
        isRedSuit(card) ? 'text-red-500' : 'text-gray-900'
      }`}
      style={{ perspective: 1000 }}
    >
      {card}
    </motion.div>
  );

  return (
    <GameLayout
      title="Baccarat"
      description="Bet on Player, Banker, or Tie"
      onPlay={handlePlay}
      gameName="baccarat"
    >
      <div className="space-y-6">
        {/* Betting Options */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={bet === option.id ? "default" : "outline"}
                onClick={() => setBet(option.id)}
                className={`h-28 sm:h-32 flex-col w-full relative overflow-hidden transition-all duration-300 ${
                  bet === option.id 
                    ? `bg-gradient-to-br ${option.color} border-0 shadow-lg` 
                    : 'hover:border-primary/50'
                }`}
              >
                {bet === option.id && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.div 
                  className="text-3xl mb-2"
                  animate={bet === option.id ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {option.icon}
                </motion.div>
                <div className="text-lg sm:text-xl font-bold">{option.name}</div>
                <div className="text-xs sm:text-sm opacity-80">{option.payout}</div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Card Table */}
        <AnimatePresence>
          {(playerCards.length > 0 || bankerCards.length > 0) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-2xl p-6 border border-green-600/30"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Player Side */}
                <div className="text-center">
                  <motion.p 
                    className="text-blue-400 font-bold mb-3 text-sm sm:text-base"
                    animate={winner === 'Player' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: winner === 'Player' ? Infinity : 0, duration: 0.5 }}
                  >
                    PLAYER {winner === 'Player' && '🏆'}
                  </motion.p>
                  <div className="flex gap-2 justify-center">
                    {playerCards.map((card, index) => (
                      <CardComponent key={index} card={card} index={index} delay={index * 0.2} />
                    ))}
                  </div>
                </div>

                {/* Banker Side */}
                <div className="text-center">
                  <motion.p 
                    className="text-red-400 font-bold mb-3 text-sm sm:text-base"
                    animate={winner === 'Banker' ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: winner === 'Banker' ? Infinity : 0, duration: 0.5 }}
                  >
                    BANKER {winner === 'Banker' && '🏆'}
                  </motion.p>
                  <div className="flex gap-2 justify-center">
                    {bankerCards.map((card, index) => (
                      <CardComponent key={index} card={card} index={index} delay={0.1 + index * 0.2} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Winner Announcement */}
              {winner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <div className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${
                    winner === 'Player' ? 'bg-blue-500/30 text-blue-300' :
                    winner === 'Banker' ? 'bg-red-500/30 text-red-300' :
                    'bg-green-500/30 text-green-300'
                  }`}>
                    {winner === 'Tie' ? '🤝 Tie Game!' : `${winner} Wins!`}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            Classic casino game - predict who will have the higher hand!
          </p>
        </motion.div>
      </div>
    </GameLayout>
  );
};

export default Baccarat;
