import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];

const Slots = () => {
  const [reels, setReels] = useState([0, 0, 0]);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    // Animate reels
    const interval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
      ]);
    }, 100);

    const tx = await casinoGamesContract.playSlots({
      value: parseEther(betAmount),
    });
    await tx.wait();

    clearInterval(interval);

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const finalReels = win 
      ? [0, 0, 0] 
      : [
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
        ];
    
    setReels(finalReels);

    return { win, tx };
  };

  return (
    <GameLayout
      title="Slots"
      description="Spin the reels and match the symbols!"
      onPlay={handlePlay}
      gameName="slots"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {reels.map((reel, index) => (
            <div
              key={index}
              className="aspect-square bg-muted/20 rounded-xl flex items-center justify-center text-6xl border-2 border-primary/20"
            >
              {SYMBOLS[reel]}
            </div>
          ))}
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Match all 3 symbols to win!
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Slots;
