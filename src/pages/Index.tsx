import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { 
  Coins, Target, Cherry, Bomb, TrendingDown, 
  Hand, Spade, CreditCard, Circle, Flame, Fish 
} from "lucide-react";
import { motion } from "framer-motion";

const games = [
  { title: "Coin Flip", icon: Coins, path: "/game/coinflip", description: "Heads or Tails - 50/50 chance" },
  { title: "Range", icon: Target, path: "/game/range", description: "Pick a number in range" },
  { title: "Slots", icon: Cherry, path: "/game/slots", description: "Classic slot machine" },
  { title: "Mines", icon: Bomb, path: "/game/mines", description: "Find gems, avoid mines" },
  { title: "Plinko", icon: TrendingDown, path: "/game/plinko", description: "Drop the ball, win big" },
  { title: "Rock Paper Scissors", icon: Hand, path: "/game/rps", description: "Classic game vs house" },
  { title: "Video Poker", icon: Spade, path: "/game/videopoker", description: "5-card poker game" },
  { title: "Baccarat", icon: CreditCard, path: "/game/baccarat", description: "Player, Banker or Tie" },
  { title: "Roulette", icon: Circle, path: "/game/roulette", description: "European roulette wheel" },
  { title: "Limbo", icon: Flame, path: "/game/limbo", description: "How high can you go?" },
  { title: "Fish Prawn Crab", icon: Fish, path: "/game/fishprawncrab", description: "Asian dice game" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-6xl font-black mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <span className="text-gradient-red glow-red">CASINO</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Welcome to the ultimate Web3 casino on ARC Testnet. 
            Connect your wallet and start playing provably fair games on-chain.
          </motion.p>
        </motion.div>

        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Spade className="w-8 h-8 text-primary" />
            Choose Your Game
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <GameCard {...game} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.div 
            className="card-casino p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-4xl font-bold text-primary mb-2">11</h3>
            <p className="text-muted-foreground">Games Available</p>
          </motion.div>
          <motion.div 
            className="card-casino p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-4xl font-bold text-primary mb-2">On-Chain</h3>
            <p className="text-muted-foreground">Provably Fair</p>
          </motion.div>
          <motion.div 
            className="card-casino p-6 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-4xl font-bold text-primary mb-2">ARC</h3>
            <p className="text-muted-foreground">Testnet Ready</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
