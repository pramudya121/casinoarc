import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const Baccarat = () => {
  const [bet, setBet] = useState<number>(0); // 0=Player, 1=Banker, 2=Tie
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    const tx = await casinoGamesContract.playBaccarat(bet, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    return { win, tx };
  };

  const options = [
    { id: 0, name: 'Player', payout: '1:1' },
    { id: 1, name: 'Banker', payout: '1:1' },
    { id: 2, name: 'Tie', payout: '8:1' },
  ];

  return (
    <GameLayout
      title="Baccarat"
      description="Bet on Player, Banker, or Tie"
      onPlay={handlePlay}
      gameName="baccarat"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {options.map((option) => (
            <Button
              key={option.id}
              variant={bet === option.id ? "default" : "outline"}
              onClick={() => setBet(option.id)}
              className="h-32 flex-col"
            >
              <div className="text-2xl font-bold mb-2">{option.name}</div>
              <div className="text-sm text-muted-foreground">{option.payout}</div>
            </Button>
          ))}
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Choose your bet and test your luck!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Baccarat;
