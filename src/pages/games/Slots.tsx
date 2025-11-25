import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];

const Slots = () => {
  const [reels, setReels] = useState([0, 0, 0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const { casinoGamesContract } = useWeb3();
  const { playSpinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setIsSpinning(true);
    playSpinSound();

    // Animate reels
    const interval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ]);
    }, 100);

    const tx = await casinoGamesContract.playSlots({
      value: parseEther(betAmount),
    });
    await tx.wait();

    clearInterval(interval);

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const finalReels = win 
      ? [0, 0, 0] 
      : [
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
        ];
    
    setReels(finalReels);
    setIsSpinning(false);

    return { win, tx };
  };

  return (
    <GameLayout
      title="Slots"
      description="Spin the reels and match the symbols!"
      onPlay={handlePlay}
      gameName="slots"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {reels.map((reel, index) => (
            <motion.div
              key={index}
              className="aspect-square bg-muted/20 rounded-xl flex items-center justify-center text-6xl border-2 border-primary/20"
              animate={isSpinning ? {
                y: [0, -10, 0],
              } : {}}
              transition={{
                duration: 0.3,
                repeat: isSpinning ? Infinity : 0,
                delay: index * 0.1
              }}
            >
              <motion.div
                animate={isSpinning ? {
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{
                  duration: 0.3,
                  repeat: isSpinning ? Infinity : 0,
                }}
              >
                {SYMBOLS[reel]}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Match all 3 symbols to win!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Slots;
