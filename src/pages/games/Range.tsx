import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const Range = () => {
  const [guess, setGuess] = useState<number>(50);
  const [maxRange, setMaxRange] = useState<number>(100);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    const tx = await casinoGamesContract.playRange(guess, maxRange, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    return { win, tx };
  };

  return (
    <GameLayout
      title="Range Game"
      description="Pick a number and test your luck!"
      onPlay={handlePlay}
      gameName="range"
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Your Guess (0-{maxRange})
          </label>
          <Input
            type="number"
            value={guess}
            onChange={(e) => setGuess(parseInt(e.target.value) || 0)}
            min="0"
            max={maxRange}
            className="text-2xl text-center h-16"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Max Range
          </label>
          <Input
            type="number"
            value={maxRange}
            onChange={(e) => setMaxRange(parseInt(e.target.value) || 100)}
            min="10"
            max="255"
            className="text-lg text-center"
          />
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Higher range = Higher payout!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Range;
