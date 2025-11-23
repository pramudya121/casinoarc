import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const animals = [
  { id: 0, name: 'Fish', emoji: '🐟' },
  { id: 1, name: 'Prawn', emoji: '🦐' },
  { id: 2, name: 'Crab', emoji: '🦀' },
  { id: 3, name: 'Rooster', emoji: '🐓' },
  { id: 4, name: 'Gourd', emoji: '🎃' },
  { id: 5, name: 'Coin', emoji: '🪙' },
];

const FishPrawnCrab = () => {
  const [selected, setSelected] = useState<number>(0);
  const [dice, setDice] = useState<number[]>([]);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setDice([]);
    
    const tx = await casinoGamesContract.playFishPrawnCrab(selected, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const rolledDice = [
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 6),
    ];
    setDice(rolledDice);

    return { win, tx };
  };

  return (
    <GameLayout
      title="Fish Prawn Crab"
      description="Traditional Asian dice game - Pick your animal!"
      onPlay={handlePlay}
      gameName="fishprawncrab"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {animals.map((animal) => (
            <Button
              key={animal.id}
              variant={selected === animal.id ? "default" : "outline"}
              onClick={() => setSelected(animal.id)}
              className="h-32 text-2xl"
            >
              <div className="space-y-2">
                <div className="text-4xl">{animal.emoji}</div>
                <div className="text-sm">{animal.name}</div>
              </div>
            </Button>
          ))}
        </div>

        {dice.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-4 text-center">Dice Results:</p>
            <div className="grid grid-cols-3 gap-4">
              {dice.map((die, index) => (
                <div
                  key={index}
                  className="aspect-square bg-white text-black rounded-xl flex items-center justify-center text-6xl border-4 border-primary/20"
                >
                  {animals[die].emoji}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default FishPrawnCrab;
