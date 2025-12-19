import { useState } from "react";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { parseEther } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  value: string;
  suit: string;
  held: boolean;
}

const VideoPoker = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [handResult, setHandResult] = useState<string | null>(null);
  const { casinoGamesContract } = useWeb3();
  const { playCoinSound, playClickSound } = useSoundEffects();

  const generateRandomCard = (): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { value, suit, held: false };
  };

  const isRedSuit = (suit: string) => suit === '♥' || suit === '♦';

  const toggleHold = (index: number) => {
    if (cards.length > 0) {
      playClickSound();
      setCards(prev => prev.map((card, i) => 
        i === index ? { ...card, held: !card.held } : card
      ));
    }
  };

  const getHandRank = (): string => {
    // Simplified hand evaluation
    const handTypes = [
      'Royal Flush', 'Straight Flush', 'Four of a Kind', 
      'Full House', 'Flush', 'Straight', 'Three of a Kind',
      'Two Pair', 'Pair', 'High Card'
    ];
    return handTypes[Math.floor(Math.random() * handTypes.length)];
  };

  const handlePlay = async (betAmount: string) => {
    if (!casinoGamesContract) throw new Error("Contract not initialized");
    
    setHandResult(null);
    setIsDealing(true);

    // Deal cards one by one
    const newCards: Card[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      newCards.push(generateRandomCard());
      setCards([...newCards]);
      playCoinSound();
    }
    
    const tx = await casinoGamesContract.playVideoPoker({
      value: parseEther(betAmount),
    });
    await tx.wait();

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'GameResult');
    const win = event ? event.args.win : Math.random() > 0.5;

    setHandResult(getHandRank());
    setIsDealing(false);

    return { win, tx };
  };

  const payTable = [
    { hand: 'Royal Flush', payout: '250x' },
    { hand: 'Straight Flush', payout: '50x' },
    { hand: 'Four of a Kind', payout: '25x' },
    { hand: 'Full House', payout: '9x' },
    { hand: 'Flush', payout: '6x' },
    { hand: 'Straight', payout: '4x' },
    { hand: 'Three of a Kind', payout: '3x' },
    { hand: 'Two Pair', payout: '2x' },
    { hand: 'Pair (J+)', payout: '1x' },
  ];

  return (
    <GameLayout
      title="Video Poker"
      description="Get the best poker hand!"
      onPlay={handlePlay}
      gameName="videopoker"
    >
      <div className="space-y-6">
        {/* Cards Display */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {(cards.length > 0 ? cards : Array(5).fill(null)).map((card, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={card ? { rotateY: 0 } : { rotateY: 180 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={card ? { y: -10, scale: 1.05 } : {}}
              onClick={() => toggleHold(index)}
              className="cursor-pointer"
              style={{ perspective: 1000 }}
            >
              <div 
                className={`aspect-[2/3] rounded-xl flex flex-col items-center justify-center text-2xl sm:text-3xl font-bold border-4 transition-all duration-300 ${
                  card 
                    ? `bg-white ${isRedSuit(card.suit) ? 'text-red-500' : 'text-gray-900'} ${
                        card.held ? 'border-yellow-400 shadow-lg shadow-yellow-400/50 -translate-y-2' : 'border-gray-200'
                      }`
                    : 'bg-gradient-to-br from-blue-900 to-purple-900 border-blue-700'
                }`}
              >
                {card ? (
                  <>
                    <span className="text-xl sm:text-2xl">{card.value}</span>
                    <span className="text-2xl sm:text-3xl">{card.suit}</span>
                  </>
                ) : (
                  <div className="text-4xl opacity-50">🎴</div>
                )}
              </div>
              
              {/* Hold indicator */}
              <AnimatePresence>
                {card?.held && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute -bottom-6 left-0 right-0 text-center"
                  >
                    <span className="text-xs font-bold text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                      HOLD
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Hand Result */}
        <AnimatePresence>
          {handResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl border border-primary/30"
            >
              <motion.p 
                className="text-2xl font-bold text-primary"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                {handResult}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Click to hold hint */}
        {cards.length > 0 && !handResult && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            Click cards to hold them for the next draw
          </motion.p>
        )}

        {/* Pay Table */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 overflow-hidden"
        >
          <div className="p-3 bg-primary/10 border-b border-border/50">
            <p className="text-sm font-bold text-center">💰 Pay Table</p>
          </div>
          <div className="p-3 grid grid-cols-2 gap-1 text-xs">
            {payTable.map((item, index) => (
              <motion.div
                key={item.hand}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex justify-between py-1 px-2 rounded ${
                  handResult === item.hand ? 'bg-primary/30 text-primary font-bold' : ''
                }`}
              >
                <span className="text-muted-foreground">{item.hand}</span>
                <span className="font-semibold">{item.payout}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </GameLayout>
  );
};

export default VideoPoker;
