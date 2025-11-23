import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const CoinFlip = () => {
  const [choice, setChoice] = useState<0 | 1>(0); // 0 = Heads, 1 = Tails
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    const tx = await casinoGamesContract.playCoinFlip(choice, {
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
      title="Coin Flip"
      description="Choose heads or tails and flip the coin!"
      onPlay={handlePlay}
      gameName="coinflip"
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Choose your side</p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={choice === 0 ? "default" : "outline"}
              onClick={() => setChoice(0)}
              className="h-32 text-2xl"
            >
              <div className="space-y-2">
                <div className="text-4xl">👑</div>
                <div>Heads</div>
              </div>
            </Button>
            <Button
              variant={choice === 1 ? "default" : "outline"}
              onClick={() => setChoice(1)}
              className="h-32 text-2xl"
            >
              <div className="space-y-2">
                <div className="text-4xl">🦅</div>
                <div>Tails</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default CoinFlip;
