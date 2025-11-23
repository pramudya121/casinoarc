import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const Roulette = () => {
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [result, setResult] = useState<number | null>(null);
  const { casinoGamesContract } = useWeb3();

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setResult(null);
    
    const tx = await casinoGamesContract.playRoulette(selectedNumber, {
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    const winningNumber = Math.floor(Math.random() * 37);
    setResult(winningNumber);

    return { win, tx };
  };

  const isRed = (num: number) => {
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return redNumbers.includes(num);
  };

  return (
    <GameLayout
      title="Roulette"
      description="European Roulette - Pick your lucky number!"
      onPlay={handlePlay}
      gameName="roulette"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 37 }).map((_, num) => (
            <Button
              key={num}
              variant={selectedNumber === num ? "default" : "outline"}
              onClick={() => setSelectedNumber(num)}
              className={`aspect-square ${
                num === 0 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : isRed(num) 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-800 hover:bg-gray-900'
              }`}
            >
              {num}
            </Button>
          ))}
        </div>

        {result !== null && (
          <div className="text-center p-6 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Winning Number:</p>
            <div className="text-6xl font-bold mb-2">{result}</div>
            <div 
              className={`inline-block px-4 py-2 rounded-full ${
                result === 0 
                  ? 'bg-green-600' 
                  : isRed(result) 
                  ? 'bg-red-600' 
                  : 'bg-gray-800'
              }`}
            >
              {result === 0 ? 'Green' : isRed(result) ? 'Red' : 'Black'}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default Roulette;
