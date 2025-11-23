import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const VideoPoker = () => {
  const [cards, setCards] = useState<string[]>([]);
  const { casinoGamesContract } = useWeb3();

  const generateRandomCard = () => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return `${value}${suit}`;
  };

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    const newCards = Array.from({ length: 5 }, generateRandomCard);
    setCards(newCards);
    
    const tx = await casinoGamesContract.playVideoPoker({
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
      title="Video Poker"
      description="Get the best poker hand!"
      onPlay={handlePlay}
      gameName="videopoker"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-2">
          {(cards.length ? cards : ['?', '?', '?', '?', '?']).map((card, index) => (
            <div
              key={index}
              className="aspect-[2/3] bg-white text-black rounded-lg flex items-center justify-center text-3xl font-bold border-4 border-primary/20"
            >
              {card}
            </div>
          ))}
        </div>
        <div className="text-center p-4 bg-muted/20 rounded-lg space-y-2">
          <p className="text-sm font-bold">Winning Hands:</p>
          <p className="text-xs text-muted-foreground">
            Royal Flush • Straight Flush • Four of a Kind • Full House • Flush • Straight • Three of a Kind
          </p>
        </div>
      </div>
    </GameLayout>
  );
};

export default VideoPoker;
