import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const wallets = [
  { name: 'MetaMask', id: 'metamask', icon: '🦊' },
  { name: 'OKX Wallet', id: 'okx', icon: '⭕' },
  { name: 'Bitget Wallet', id: 'bitget', icon: '🔷' },
  { name: 'Rabby Wallet', id: 'rabby', icon: '🐰' },
];

export const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { connect } = useWeb3();

  const handleConnect = async (walletId: string) => {
    await connect(walletId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="card-casino max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 mt-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.id}
              variant="outline"
              className="h-14 text-lg justify-start gap-3 hover:border-primary hover:bg-primary/10 transition-all"
              onClick={() => handleConnect(wallet.id)}
            >
              <span className="text-2xl">{wallet.icon}</span>
              {wallet.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
