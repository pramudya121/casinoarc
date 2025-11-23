import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, User, LogOut, Spade, Trophy, TrendingUp } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useState } from "react";
import { WalletModal } from "./WalletModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { account, disconnect, balance } = useWeb3();
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <>
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Spade className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-3xl font-black tracking-tight text-gradient-red glow-red">
              CASINO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Casino Leaders
            </Link>
            <Link to="/traders" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Top Traders
            </Link>
            {account && (
              <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                <User className="w-4 h-4" />
                Profile
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {account ? (
              <>
                <div className="hidden sm:flex flex-col items-end text-sm">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-bold text-primary">{parseFloat(balance).toFixed(4)} USDC</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Wallet className="w-4 h-4" />
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={disconnect} className="flex items-center gap-2 cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setShowWalletModal(true)} className="btn-casino gap-2">
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>
      <WalletModal open={showWalletModal} onClose={() => setShowWalletModal(false)} />
    </>
  );
};
