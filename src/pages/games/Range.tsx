import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Slider } from "@/components/ui/slider";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Range = () => {
  const [guess, setGuess] = useState<number>(50);
  const [maxRange, setMaxRange] = useState<number>(100);
  const [result, setResult] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { casinoGamesContract } = useWeb3();
  const { playSpinSound, playCoinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setResult(null);
    setIsAnimating(true);
    playSpinSound();

    const tx = await casinoGamesContract.playRange(guess, maxRange, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    // Animate to result
    const finalResult = Math.floor(Math.random() * maxRange) + 1;
    
    // Animate counting
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setResult(Math.floor(Math.random() * maxRange) + 1);
    }
    
    setResult(finalResult);
    setIsAnimating(false);
    playCoinSound();

    return { win, tx };
  };

  const winChance = ((guess / maxRange) * 100).toFixed(1);
  const multiplier = ((maxRange / guess) * 0.97).toFixed(2);
  const isWin = result !== null && result <= guess;

  return (
    <GameLayout
      title="Range Game"
      description="Pick a number and test your luck!"
      onPlay={handlePlay}
      gameName="range"
    >
      <div className="space-y-6">
        {/* Visual Range Display */}
        <div className="relative h-32 bg-gradient-to-r from-green-500/30 via-yellow-500/30 to-red-500/30 rounded-2xl overflow-hidden">
          {/* Winning zone indicator */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-green-500/50 to-green-400/30"
            style={{ width: `${(guess / maxRange) * 100}%` }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Guess marker */}
          <motion.div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
            style={{ left: `${(guess / maxRange) * 100}%` }}
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />

          {/* Result marker */}
          <AnimatePresence>
            {result !== null && (
              <motion.div
                initial={{ top: -50, opacity: 0 }}
                animate={{ top: '50%', opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                  left: `${(result / maxRange) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  isWin ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
                }`}
              >
                {result}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Range labels */}
          <div className="absolute bottom-2 left-4 text-sm font-bold text-white/80">0</div>
          <div className="absolute bottom-2 right-4 text-sm font-bold text-white/80">{maxRange}</div>
          <div 
            className="absolute bottom-2 text-sm font-bold text-white"
            style={{ left: `${(guess / maxRange) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {guess}
          </div>
        </div>

        {/* Guess Slider */}
        <div className="space-y-4 bg-card/50 rounded-xl p-6 border border-border/50">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground">
              Roll Under
            </label>
            <motion.span 
              className="text-3xl font-bold text-primary"
              key={guess}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {guess}
            </motion.span>
          </div>
          
          <Slider
            value={[guess]}
            onValueChange={(values) => setGuess(values[0])}
            min={1}
            max={maxRange - 1}
            step={1}
            className="py-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low Risk</span>
            <span>High Risk</span>
          </div>
        </div>

        {/* Range Setting */}
        <div className="space-y-4 bg-card/50 rounded-xl p-6 border border-border/50">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-muted-foreground">
              Max Range
            </label>
            <motion.span 
              className="text-xl font-bold text-muted-foreground"
              key={maxRange}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              0 - {maxRange}
            </motion.span>
          </div>
          
          <Slider
            value={[maxRange]}
            onValueChange={(values) => {
              setMaxRange(values[0]);
              if (guess >= values[0]) setGuess(values[0] - 1);
            }}
            min={10}
            max={255}
            step={1}
            className="py-4"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Win Chance</p>
            <p className="text-2xl font-bold text-green-400">{winChance}%</p>
          </motion.div>
          
          <motion.div 
            className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/30 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Multiplier</p>
            <p className="text-2xl font-bold text-purple-400">{multiplier}x</p>
          </motion.div>
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {result !== null && !isAnimating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-xl text-center ${
                isWin 
                  ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 border border-green-500/50' 
                  : 'bg-gradient-to-br from-red-500/30 to-red-600/20 border border-red-500/50'
              }`}
            >
              <motion.div 
                className="text-5xl mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                {isWin ? '🎉' : '💔'}
              </motion.div>
              <p className="text-xl font-bold">
                Result: <span className={isWin ? 'text-green-400' : 'text-red-400'}>{result}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isWin ? `${result} ≤ ${guess} - You Win!` : `${result} > ${guess} - Try Again!`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default Range;
