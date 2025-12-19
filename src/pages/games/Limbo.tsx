import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Slider } from "@/components/ui/slider";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Limbo = () => {
  const [target, setTarget] = useState<number>(2);
  const [result, setResult] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingValue, setAnimatingValue] = useState(1);
  const { casinoGamesContract } = useWeb3();
  const { playSpinSound, playCoinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setResult(null);
    setIsAnimating(true);
    playSpinSound();

    // Animate counting up
    const finalValue = parseFloat((Math.random() * 10 + 1).toFixed(2));
    const steps = 30;
    const stepDuration = 50;
    
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      const progress = i / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatingValue(1 + (finalValue - 1) * eased);
    }
    
    const tx = await casinoGamesContract.playLimbo(Math.floor(target * 100), {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    setResult(finalValue);
    setIsAnimating(false);
    playCoinSound();

    return { win, tx };
  };

  const winChance = (100 / target).toFixed(2);
  const potentialMultiplier = (target * 0.97).toFixed(2);

  return (
    <GameLayout
      title="Limbo"
      description="Set your target multiplier and go!"
      onPlay={handlePlay}
      gameName="limbo"
    >
      <div className="space-y-8">
        {/* Result Display */}
        <motion.div 
          className="relative h-48 sm:h-56 flex items-center justify-center rounded-2xl overflow-hidden"
          style={{
            background: result !== null 
              ? result >= target 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))' 
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))'
          }}
        >
          {/* Background animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          <AnimatePresence mode="wait">
            {result !== null ? (
              <motion.div
                key="result"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center"
              >
                <motion.div 
                  className={`text-6xl sm:text-8xl font-black ${
                    result >= target ? 'text-green-400' : 'text-red-400'
                  }`}
                  animate={result >= target ? { 
                    textShadow: ['0 0 20px rgba(34, 197, 94, 0.5)', '0 0 40px rgba(34, 197, 94, 0.8)', '0 0 20px rgba(34, 197, 94, 0.5)']
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {result.toFixed(2)}x
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg mt-2"
                >
                  {result >= target ? '🚀 You Won!' : '💫 Try Again!'}
                </motion.p>
              </motion.div>
            ) : isAnimating ? (
              <motion.div
                key="animating"
                className="text-6xl sm:text-8xl font-black text-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              >
                {animatingValue.toFixed(2)}x
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold text-muted-foreground mb-2">
                  Target: {target.toFixed(2)}x
                </div>
                <p className="text-muted-foreground">Ready to play!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Target Slider */}
        <div className="space-y-4 bg-card/50 rounded-xl p-6 border border-border/50">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground">
              Target Multiplier
            </label>
            <motion.span 
              className="text-2xl font-bold text-primary"
              key={target}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {target.toFixed(2)}x
            </motion.span>
          </div>
          
          <Slider
            value={[target]}
            onValueChange={(values) => setTarget(values[0])}
            min={1.01}
            max={10}
            step={0.01}
            className="py-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1.01x (Safe)</span>
            <span>10x (Risky)</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Win Chance</p>
            <p className="text-2xl font-bold text-blue-400">{winChance}%</p>
          </motion.div>
          
          <motion.div 
            className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Potential Win</p>
            <p className="text-2xl font-bold text-green-400">{potentialMultiplier}x</p>
          </motion.div>
        </div>
      </div>
    </GameLayout>
  );
};

export default Limbo;
