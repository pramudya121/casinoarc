import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const CoinFlip = () => {
  const [choice, setChoice] = useState<0 | 1>(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<0 | 1 | null>(null);
  const { casinoGamesContract } = useWeb3();
  const { playCoinSound, playClickSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setIsFlipping(true);
    setResult(null);
    playCoinSound();

    const tx = await casinoGamesContract.playCoinFlip(choice, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    // Simulate coin flip result
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult(win ? choice : (choice === 0 ? 1 : 0));
    setIsFlipping(false);

    return { win, tx };
  };

  return (
    <GameLayout
      title="Coin Flip"
      description="Choose heads or tails and flip the coin!"
      onPlay={handlePlay}
      gameName="coinflip"
    >
      <div className="space-y-8">
        {/* 3D Coin Animation */}
        <div className="flex justify-center py-8">
          <motion.div
            className="relative w-40 h-40 sm:w-48 sm:h-48"
            animate={isFlipping ? {
              rotateY: [0, 1800],
              rotateX: [0, 360],
            } : {}}
            transition={{ duration: 2, ease: "easeInOut" }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
          >
            {/* Coin front (Heads) */}
            <motion.div
              className={`absolute inset-0 rounded-full flex items-center justify-center text-6xl sm:text-7xl border-8 ${
                result === 0 
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-300 shadow-2xl shadow-yellow-500/50' 
                  : 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-300'
              }`}
              style={{ backfaceVisibility: 'hidden' }}
              animate={!isFlipping && result === 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: result === 0 ? 3 : 0 }}
            >
              <div className="text-center">
                <div className="text-5xl sm:text-6xl">👑</div>
                <div className="text-xs font-bold text-amber-900 mt-1">HEADS</div>
              </div>
            </motion.div>

            {/* Coin back (Tails) */}
            <motion.div
              className={`absolute inset-0 rounded-full flex items-center justify-center text-6xl sm:text-7xl border-8 ${
                result === 1 
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200 shadow-2xl shadow-gray-500/50' 
                  : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-200'
              }`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              animate={!isFlipping && result === 1 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: result === 1 ? 3 : 0 }}
            >
              <div className="text-center">
                <div className="text-5xl sm:text-6xl">🦅</div>
                <div className="text-xs font-bold text-gray-700 mt-1">TAILS</div>
              </div>
            </motion.div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {result !== null && !isFlipping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`text-center p-4 rounded-xl ${
                result === choice 
                  ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/20 border border-green-500/50' 
                  : 'bg-gradient-to-r from-red-500/30 to-rose-500/20 border border-red-500/50'
              }`}
            >
              <p className="text-xl font-bold">
                {result === 0 ? '👑 Heads!' : '🦅 Tails!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {result === choice ? '🎉 You won!' : 'Better luck next time!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Choice Selection */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">Choose your side</p>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant={choice === 0 ? "default" : "outline"}
                onClick={() => { setChoice(0); playClickSound(); }}
                disabled={isFlipping}
                className={`h-28 sm:h-32 text-2xl w-full relative overflow-hidden transition-all duration-300 ${
                  choice === 0 
                    ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-0 shadow-lg shadow-yellow-500/30' 
                    : 'hover:border-yellow-500/50'
                }`}
              >
                {choice === 0 && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.div 
                  className="space-y-2 relative z-10"
                  animate={choice === 0 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="text-4xl sm:text-5xl">👑</div>
                  <div className="text-base sm:text-lg font-bold">Heads</div>
                </motion.div>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant={choice === 1 ? "default" : "outline"}
                onClick={() => { setChoice(1); playClickSound(); }}
                disabled={isFlipping}
                className={`h-28 sm:h-32 text-2xl w-full relative overflow-hidden transition-all duration-300 ${
                  choice === 1 
                    ? 'bg-gradient-to-br from-gray-500 to-gray-700 border-0 shadow-lg shadow-gray-500/30' 
                    : 'hover:border-gray-500/50'
                }`}
              >
                {choice === 1 && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.div 
                  className="space-y-2 relative z-10"
                  animate={choice === 1 ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <div className="text-4xl sm:text-5xl">🦅</div>
                  <div className="text-base sm:text-lg font-bold">Tails</div>
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            50/50 chance • Win 1.94x your bet!
          </p>
        </motion.div>
      </div>
    </GameLayout>
  );
};

export default CoinFlip;
