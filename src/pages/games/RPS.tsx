import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

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
              <Button
                key={choice.id}
                variant={playerChoice === choice.id ? "default" : "outline"}
                onClick={() => setPlayerChoice(choice.id)}
                className="h-32 text-2xl"
              >
                <div className="space-y-2">
                  <div className="text-4xl">{choice.emoji}</div>
                  <div>{choice.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {houseChoice !== null && (
          <div className="text-center p-6 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">House chose:</p>
            <div className="text-6xl mb-2">{choices[houseChoice].emoji}</div>
            <p className="text-lg font-bold">{choices[houseChoice].name}</p>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default RPS;
