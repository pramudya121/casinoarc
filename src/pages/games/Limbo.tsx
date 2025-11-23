import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const Limbo = () => {
  const [target, setTarget] = useState<number>(2);
  const [result, setResult] = useState<number | null>(null);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setResult(null);
    
    const tx = await casinoGamesContract.playLimbo(Math.floor(target * 100), {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const outcomeValue = (Math.random() * 10 + 1).toFixed(2);
    setResult(parseFloat(outcomeValue));

    return { win, tx };
  };

  return (
    <GameLayout
      title="Limbo"
      description="Set your target multiplier and go!"
      onPlay={handlePlay}
      gameName="limbo"
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Target Multiplier (x)
          </label>
          <Input
            type="number"
            value={target}
            onChange={(e) => setTarget(parseFloat(e.target.value) || 1)}
            step="0.1"
            min="1"
            max="10"
            className="text-3xl text-center h-20"
          />
        </div>

        {result !== null && (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Result:</p>
            <div className={`text-7xl font-bold ${result >= target ? 'text-green-500' : 'text-red-500'}`}>
              {result.toFixed(2)}x
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {result >= target ? '🎉 You Won!' : 'Try Again!'}
            </p>
          </div>
        )}

        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Potential Win: {(parseFloat((target * 0.97).toFixed(2)))}x
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Limbo;
