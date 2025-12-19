import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SYMBOLS = [
  { emoji: '🍒', name: 'Cherry', multiplier: 2 },
  { emoji: '🍋', name: 'Lemon', multiplier: 3 },
  { emoji: '🍊', name: 'Orange', multiplier: 4 },
  { emoji: '🍇', name: 'Grape', multiplier: 5 },
  { emoji: '💎', name: 'Diamond', multiplier: 10 },
  { emoji: '7️⃣', name: 'Seven', multiplier: 20 },
];

const Slots = () => {
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<number[]>([0, 0, 0]);
  const { casinoGamesContract } = useWeb3();
  const { playSpinSound, playCoinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setIsSpinning(true);
    playSpinSound();

    // Start all reels spinning
    setSpinPhase([1, 1, 1]);

    // Animate reels
    const interval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ]);
    }, 80);

    const tx = await casinoGamesContract.playSlots({
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    // Stop reels one by one
    await new Promise(resolve => setTimeout(resolve, 500));
    setSpinPhase([0, 1, 1]);
    playCoinSound();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setSpinPhase([0, 0, 1]);
    playCoinSound();
    
    await new Promise(resolve => setTimeout(resolve, 400));
    setSpinPhase([0, 0, 0]);
    clearInterval(interval);

    const finalReels = win 
      ? [0, 0, 0] 
      : [
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
        ];
    
    setReels(finalReels);
    setIsSpinning(false);
    playCoinSound();

    return { win, tx };
  };

  const isWin = reels[0] === reels[1] && reels[1] === reels[2];

  return (
    <GameLayout
      title="Slots"
      description="Spin the reels and match the symbols!"
      onPlay={handlePlay}
      gameName="slots"
    >
      <div className="space-y-6">
        {/* Slot Machine Frame */}
        <div className="relative">
          {/* Machine top decoration */}
          <motion.div 
            className="h-8 bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-3xl border-4 border-b-0 border-amber-500 flex items-center justify-center"
            animate={isWin && !isSpinning ? { 
              boxShadow: ['0 0 20px rgba(251, 191, 36, 0.5)', '0 0 40px rgba(251, 191, 36, 0.8)', '0 0 20px rgba(251, 191, 36, 0.5)']
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <span className="text-amber-200 text-xs font-bold tracking-widest">★ LUCKY SLOTS ★</span>
          </motion.div>
          
          {/* Reels container */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-4 sm:p-6 border-4 border-amber-500 border-t-0 border-b-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {reels.map((reel, index) => (
                <motion.div
                  key={index}
                  className="relative aspect-square bg-gradient-to-b from-white to-gray-100 rounded-xl flex items-center justify-center text-5xl sm:text-7xl overflow-hidden border-4 border-gray-300 shadow-inner"
                  animate={spinPhase[index] ? {
                    boxShadow: ['inset 0 0 20px rgba(0,0,0,0.3)', 'inset 0 0 40px rgba(0,0,0,0.5)', 'inset 0 0 20px rgba(0,0,0,0.3)']
                  } : isWin && !isSpinning ? {
                    boxShadow: ['0 0 20px rgba(251, 191, 36, 0.5)', '0 0 40px rgba(251, 191, 36, 0.8)', '0 0 20px rgba(251, 191, 36, 0.5)']
                  } : {}}
                  transition={{
                    duration: 0.3,
                    repeat: spinPhase[index] || (isWin && !isSpinning) ? Infinity : 0,
                  }}
                >
                  {/* Blur effect when spinning */}
                  {spinPhase[index] ? (
                    <motion.div
                      className="absolute inset-0 flex flex-col items-center"
                      animate={{ y: ['-100%', '100%'] }}
                      transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                    >
                      {SYMBOLS.map((s, i) => (
                        <span key={i} className="text-5xl sm:text-7xl py-4">{s.emoji}</span>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 10 }}
                    >
                      {SYMBOLS[reel].emoji}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Win line indicator */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className={`h-1 mx-2 transition-all duration-300 ${
                isWin && !isSpinning 
                  ? 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-lg shadow-yellow-400/50' 
                  : 'bg-gradient-to-r from-transparent via-gray-400/30 to-transparent'
              }`} />
            </div>
          </div>

          {/* Machine bottom decoration */}
          <div className="h-6 bg-gradient-to-b from-amber-700 to-amber-800 rounded-b-3xl border-4 border-t-0 border-amber-500" />
        </div>

        {/* Win Display */}
        <AnimatePresence>
          {isWin && !isSpinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-center p-6 bg-gradient-to-br from-yellow-500/30 to-amber-500/20 rounded-2xl border-2 border-yellow-500/50"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-5xl mb-2"
              >
                🎰
              </motion.div>
              <p className="text-2xl font-bold text-yellow-400">JACKPOT!</p>
              <p className="text-lg text-muted-foreground">
                3x {SYMBOLS[reels[0]].emoji} = {SYMBOLS[reels[0]].multiplier}x WIN!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Symbol Pay Table */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 p-4"
        >
          <p className="text-sm font-bold mb-3 text-center">Symbol Payouts</p>
          <div className="grid grid-cols-3 gap-2">
            {SYMBOLS.map((symbol, index) => (
              <motion.div
                key={symbol.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  isWin && reels[0] === index ? 'bg-primary/20 border border-primary/50' : 'bg-muted/20'
                }`}
              >
                <span className="text-2xl">{symbol.emoji}</span>
                <span className="text-sm font-bold">{symbol.multiplier}x</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Match all 3 symbols to win! Higher value symbols = bigger payouts!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Slots;
