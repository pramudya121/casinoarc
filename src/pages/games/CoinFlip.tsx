import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const CoinFlip = () => {
  const [choice, setChoice] = useState<0 | 1>(0); // 0 = Heads, 1 = Tails
  const [isFlipping, setIsFlipping] = useState(false);
  const { casinoGamesContract } = useWeb3();
  const { playCoinSound } = useSoundEffects();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setIsFlipping(true);
    playCoinSound();

    const tx = await casinoGamesContract.playCoinFlip(choice, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    setTimeout(() => setIsFlipping(false), 1000);

    return { win, tx };
  };

  return (
    <GameLayout
      title="Coin Flip"
      description="Choose heads or tails and flip the coin!"
      onPlay={handlePlay}
      gameName="coinflip"
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Choose your side</p>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={choice === 0 ? "default" : "outline"}
                onClick={() => setChoice(0)}
                className="h-32 text-2xl w-full"
              >
                <motion.div 
                  className="space-y-2"
                  animate={isFlipping && choice === 0 ? {
                    rotateY: [0, 180, 360, 540, 720],
                  } : {}}
                  transition={{ duration: 1 }}
                >
                  <div className="text-4xl">👑</div>
                  <div>Heads</div>
                </motion.div>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={choice === 1 ? "default" : "outline"}
                onClick={() => setChoice(1)}
                className="h-32 text-2xl w-full"
              >
                <motion.div 
                  className="space-y-2"
                  animate={isFlipping && choice === 1 ? {
                    rotateY: [0, 180, 360, 540, 720],
                  } : {}}
                  transition={{ duration: 1 }}
                >
                  <div className="text-4xl">🦅</div>
                  <div>Tails</div>
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default CoinFlip;
