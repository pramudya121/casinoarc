import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CoinFlip from "./pages/games/CoinFlip";
import Range from "./pages/games/Range";
import Slots from "./pages/games/Slots";
import Mines from "./pages/games/Mines";
import Plinko from "./pages/games/Plinko";
import RPS from "./pages/games/RPS";
import VideoPoker from "./pages/games/VideoPoker";
import Baccarat from "./pages/games/Baccarat";
import Roulette from "./pages/games/Roulette";
import Limbo from "./pages/games/Limbo";
import FishPrawnCrab from "./pages/games/FishPrawnCrab";
import Leaderboard from "./pages/Leaderboard";
import Traders from "./pages/Traders";
import Profile from "./pages/Profile";
import Tournaments from "./pages/Tournaments";
import TournamentDetail from "./pages/TournamentDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Web3Provider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game/coinflip" element={<CoinFlip />} />
            <Route path="/game/range" element={<Range />} />
            <Route path="/game/slots" element={<Slots />} />
            <Route path="/game/mines" element={<Mines />} />
            <Route path="/game/plinko" element={<Plinko />} />
            <Route path="/game/rps" element={<RPS />} />
            <Route path="/game/videopoker" element={<VideoPoker />} />
            <Route path="/game/baccarat" element={<Baccarat />} />
            <Route path="/game/roulette" element={<Roulette />} />
            <Route path="/game/limbo" element={<Limbo />} />
            <Route path="/game/fishprawncrab" element={<FishPrawnCrab />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/traders" element={<Traders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournament/:id" element={<TournamentDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </Web3Provider>
  </QueryClientProvider>
);

export default App;
