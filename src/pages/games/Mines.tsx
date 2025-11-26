import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { Bomb, Gem } from "lucide-react";
import { motion } from "framer-motion";

const GRID_SIZE = 25;

const Mines = () => {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [mines, setMines] = useState<number[]>([]);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setRevealed([]);
    const minePositions = Array.from({ length: 5 }, () => Math.floor(Math.random() * GRID_SIZE));
    setMines(minePositions);

    const tx = await casinoGamesContract.playMines(revealed, GRID_SIZE, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : !minePositions.some(m => revealed.includes(m));

    return { win, tx };
  };

  const handleCellClick = (index: number) => {
    if (!revealed.includes(index)) {
      setRevealed([...revealed, index]);
    }
  };

  return (
    <GameLayout
      title="Mines"
      description="Find the gems and avoid the mines!"
      onPlay={handlePlay}
      gameName="mines"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: GRID_SIZE }).map((_, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: revealed.includes(index) ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={revealed.includes(index) ? "default" : "outline"}
                className={`aspect-square text-2xl p-0 w-full ${
                  revealed.includes(index) && mines.includes(index)
                    ? 'bg-red-500/20 border-red-500'
                    : revealed.includes(index)
                    ? 'bg-green-500/20 border-green-500'
                    : ''
                }`}
                onClick={() => handleCellClick(index)}
              >
                {revealed.includes(index) ? (
                  mines.includes(index) ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <Bomb className="w-6 h-6 text-red-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <Gem className="w-6 h-6 text-green-500" />
                    </motion.div>
                  )
                ) : (
                  '?'
                )}
              </Button>
            </motion.div>
          ))}
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Selected: {revealed.length}/25
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Mines;
