import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion } from "framer-motion";

const Plinko = () => {
  const [ballPosition, setBallPosition] = useState<number | null>(null);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setBallPosition(null);
    
    const tx = await casinoGamesContract.playPlinko({
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const finalPosition = Math.floor(Math.random() * 9);
    setBallPosition(finalPosition);

    return { win, tx };
  };

  const multipliers = [5, 2, 1.5, 1, 0.5, 1, 1.5, 2, 5];

  return (
    <GameLayout
      title="Plinko"
      description="Drop the ball and watch it bounce!"
      onPlay={handlePlay}
      gameName="plinko"
    >
      <div className="space-y-6">
        <div className="relative h-96 bg-gradient-to-b from-muted/5 to-muted/20 rounded-xl overflow-hidden border border-primary/20">
          {ballPosition !== null && (
            <motion.div
              initial={{ y: -50, x: '50%' }}
              animate={{ y: 350, x: `${(ballPosition + 0.5) * (100 / 9)}%` }}
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="absolute w-6 h-6 bg-primary rounded-full shadow-lg shadow-primary/50"
            />
          )}
          
          <div className="absolute inset-0 flex items-end justify-center p-4">
            <div className="grid grid-cols-9 gap-2 w-full">
              {multipliers.map((mult, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={`p-2 text-center rounded text-sm font-bold transition-all ${
                    ballPosition === index
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-110'
                      : mult >= 2
                      ? 'bg-green-500/20 text-green-400'
                      : mult === 1
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {mult}x
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Land in the high multiplier zones to win big!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Plinko;
