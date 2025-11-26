import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion } from "framer-motion";

const choices = [
  { id: 0, name: 'Rock', emoji: '🪨' },
  { id: 1, name: 'Paper', emoji: '📄' },
  { id: 2, name: 'Scissors', emoji: '✂️' },
];

const RPS = () => {
  const [playerChoice, setPlayerChoice] = useState<number>(0);
  const [houseChoice, setHouseChoice] = useState<number | null>(null);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setHouseChoice(null);
    
    const tx = await casinoGamesContract.playRPS(playerChoice, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const house = Math.floor(Math.random() * 3);
    setHouseChoice(house);

    return { win, tx };
  };

  return (
    <GameLayout
      title="Rock Paper Scissors"
      description="Classic game against the house!"
      onPlay={handlePlay}
      gameName="rps"
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4 text-center">Choose your weapon</p>
          <div className="grid grid-cols-3 gap-4">
            {choices.map((choice) => (
              <motion.div
                key={choice.id}
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={playerChoice === choice.id ? "default" : "outline"}
                  onClick={() => setPlayerChoice(choice.id)}
                  className="h-32 text-2xl w-full"
                >
                  <div className="space-y-2">
                    <motion.div
                      className="text-4xl"
                      animate={playerChoice === choice.id ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      {choice.emoji}
                    </motion.div>
                    <div>{choice.name}</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {houseChoice !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center p-6 bg-muted/20 rounded-lg border border-primary/30"
          >
            <p className="text-sm text-muted-foreground mb-2">House chose:</p>
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
              className="text-6xl mb-2"
            >
              {choices[houseChoice].emoji}
            </motion.div>
            <p className="text-lg font-bold">{choices[houseChoice].name}</p>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
};

export default RPS;
