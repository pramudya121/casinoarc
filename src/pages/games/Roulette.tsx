import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const Roulette = () => {
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const { casinoGamesContract } = useWeb3();
  const { playSpinSound, playCoinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setResult(null);
    setIsSpinning(true);
    playSpinSound();

    // Animate wheel
    const spins = 3 + Math.random() * 2;
    setWheelRotation(prev => prev + spins * 360);
    
    const tx = await casinoGamesContract.playRoulette(selectedNumber, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const winningNumber = Math.floor(Math.random() * 37);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult(winningNumber);
    setIsSpinning(false);
    playCoinSound();

    return { win, tx };
  };

  const isRed = (num: number) => {
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return redNumbers.includes(num);
  };

  const getColor = (num: number) => {
    if (num === 0) return 'green';
    return isRed(num) ? 'red' : 'black';
  };

  const colorClasses = {
    green: 'bg-green-600 hover:bg-green-500 border-green-400',
    red: 'bg-red-600 hover:bg-red-500 border-red-400',
    black: 'bg-gray-800 hover:bg-gray-700 border-gray-600'
  };

  return (
    <GameLayout
      title="Roulette"
      description="European Roulette - Pick your lucky number!"
      onPlay={handlePlay}
      gameName="roulette"
    >
      <div className="space-y-6">
        {/* Roulette Wheel Animation */}
        <div className="relative h-48 flex items-center justify-center">
          <motion.div
            className="relative w-40 h-40 rounded-full bg-gradient-to-br from-amber-900 to-amber-950 border-8 border-amber-700 shadow-2xl"
            animate={{ rotate: wheelRotation }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            {/* Inner decoration */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-green-900 to-green-950 border-4 border-amber-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-3xl font-bold text-amber-400"
                  animate={isSpinning ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {isSpinning ? '🎰' : result !== null ? result : '?'}
                </motion.div>
              </div>
            </div>
            {/* Wheel segments visualization */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1/2 origin-bottom left-1/2 -translate-x-1/2"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-red-500' : 'bg-gray-900'}`} />
              </div>
            ))}
          </motion.div>
          
          {/* Ball indicator */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4"
            animate={isSpinning ? { y: [0, 10, 0] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-gray-300" />
          </motion.div>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {Array.from({ length: 37 }).map((_, num) => (
            <motion.div
              key={num}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => setSelectedNumber(num)}
                className={`w-full aspect-square text-xs sm:text-sm font-bold transition-all duration-200 ${
                  colorClasses[getColor(num)]
                } ${
                  selectedNumber === num 
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg' 
                    : ''
                } ${
                  result === num 
                    ? 'animate-pulse ring-4 ring-yellow-400' 
                    : ''
                }`}
              >
                {num}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Quick Bets */}
        <div className="grid grid-cols-3 gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="w-full bg-red-600/30 border-red-500/50 hover:bg-red-600/50"
              onClick={() => setSelectedNumber(isRed(selectedNumber) ? selectedNumber : 1)}
            >
              🔴 Red
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="w-full bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50"
              onClick={() => setSelectedNumber(!isRed(selectedNumber) && selectedNumber !== 0 ? selectedNumber : 2)}
            >
              ⚫ Black
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="w-full bg-green-600/30 border-green-500/50 hover:bg-green-600/50"
              onClick={() => setSelectedNumber(0)}
            >
              🟢 Zero
            </Button>
          </motion.div>
        </div>

        {/* Result Display */}
        <AnimatePresence>
          {result !== null && !isSpinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/50"
            >
              <p className="text-sm text-muted-foreground mb-2">Winning Number</p>
              <motion.div 
                className="text-6xl font-black mb-3"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {result}
              </motion.div>
              <motion.div 
                className={`inline-block px-6 py-2 rounded-full text-white font-bold ${
                  result === 0 
                    ? 'bg-green-600 shadow-lg shadow-green-500/30' 
                    : isRed(result) 
                    ? 'bg-red-600 shadow-lg shadow-red-500/30' 
                    : 'bg-gray-800 shadow-lg shadow-gray-500/30'
                }`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {result === 0 ? '🟢 Green' : isRed(result) ? '🔴 Red' : '⚫ Black'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameLayout>
  );
};

export default Roulette;
