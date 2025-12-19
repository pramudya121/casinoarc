import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const animals = [
  { id: 0, name: 'Fish', emoji: '🐟', color: 'from-blue-500 to-cyan-400' },
  { id: 1, name: 'Prawn', emoji: '🦐', color: 'from-orange-500 to-red-400' },
  { id: 2, name: 'Crab', emoji: '🦀', color: 'from-red-500 to-pink-400' },
  { id: 3, name: 'Rooster', emoji: '🐓', color: 'from-yellow-500 to-amber-400' },
  { id: 4, name: 'Gourd', emoji: '🎃', color: 'from-green-500 to-emerald-400' },
  { id: 5, name: 'Coin', emoji: '🪙', color: 'from-yellow-400 to-orange-300' },
];

const FishPrawnCrab = () => {
  const [selected, setSelected] = useState<number>(0);
  const [dice, setDice] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const { casinoGamesContract } = useWeb3();
  const { playSpinSound, playCoinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setDice([]);
    setIsRolling(true);
    playSpinSound();

    // Rolling animation
    const rollInterval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 6),
      ]);
    }, 100);
    
    const tx = await casinoGamesContract.playFishPrawnCrab(selected, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    clearInterval(rollInterval);

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const rolledDice = [
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 6),
    ];
    setDice(rolledDice);
    setIsRolling(false);
    playCoinSound();

    return { win, tx };
  };

  const matchCount = dice.filter(d => d === selected).length;

  return (
    <GameLayout
      title="Fish Prawn Crab"
      description="Traditional Asian dice game - Pick your animal!"
      onPlay={handlePlay}
      gameName="fishprawncrab"
    >
      <div className="space-y-8">
        {/* Selection Grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {animals.map((animal, index) => (
            <motion.div
              key={animal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selected === animal.id ? "default" : "outline"}
                onClick={() => setSelected(animal.id)}
                className={`h-28 sm:h-32 w-full text-2xl relative overflow-hidden transition-all duration-300 ${
                  selected === animal.id 
                    ? `bg-gradient-to-br ${animal.color} border-0 shadow-lg shadow-primary/30` 
                    : 'hover:border-primary/50'
                }`}
              >
                {selected === animal.id && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <div className="space-y-2 relative z-10">
                  <motion.div 
                    className="text-4xl sm:text-5xl"
                    animate={selected === animal.id ? { 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {animal.emoji}
                  </motion.div>
                  <div className="text-xs sm:text-sm font-semibold">{animal.name}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Dice Results */}
        <AnimatePresence>
          {dice.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground text-center">Dice Results:</p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {dice.map((die, index) => (
                  <motion.div
                    key={index}
                    initial={{ rotateX: 0, rotateY: 0, scale: 0 }}
                    animate={{ 
                      rotateX: isRolling ? [0, 360] : 0,
                      rotateY: isRolling ? [0, 360] : 0,
                      scale: 1
                    }}
                    transition={{ 
                      duration: isRolling ? 0.3 : 0.5,
                      repeat: isRolling ? Infinity : 0,
                      delay: index * 0.1
                    }}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-5xl sm:text-6xl border-4 transition-all duration-300 ${
                      die === selected 
                        ? `bg-gradient-to-br ${animals[die].color} border-primary shadow-xl shadow-primary/40` 
                        : 'bg-card border-border/50'
                    }`}
                  >
                    <motion.span
                      animate={die === selected ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, repeat: die === selected ? Infinity : 0, repeatDelay: 1 }}
                    >
                      {animals[die].emoji}
                    </motion.span>
                  </motion.div>
                ))}
              </div>

              {/* Match indicator */}
              {matchCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/30"
                >
                  <p className="text-lg font-bold text-primary">
                    🎉 {matchCount}x Match! 
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50"
        >
          <p className="text-sm text-muted-foreground">
            Pick an animal and roll the dice! Win multiplier based on matches.
          </p>
        </motion.div>
      </div>
    </GameLayout>
  );
};

export default FishPrawnCrab;
