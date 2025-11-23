import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther } from 'ethers';
import { ARC_TESTNET, CONTRACTS } from '@/lib/web3/config';
import { toast } from '@/hooks/use-toast';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  connect: (walletType?: string) => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
  casinoGamesContract: Contract | null;
  treasuryContract: Contract | null;
  rngContract: Contract | null;
  balance: string;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [casinoGamesContract, setCasinoGamesContract] = useState<Contract | null>(null);
  const [treasuryContract, setTreasuryContract] = useState<Contract | null>(null);
  const [rngContract, setRngContract] = useState<Contract | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${ARC_TESTNET.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${ARC_TESTNET.chainId.toString(16)}`,
                chainName: ARC_TESTNET.name,
                nativeCurrency: {
                  name: ARC_TESTNET.currency,
                  symbol: ARC_TESTNET.currency,
                  decimals: 18,
                },
                rpcUrls: [ARC_TESTNET.rpcUrl],
                blockExplorerUrls: [`https://${ARC_TESTNET.blockExplorer}`],
              },
            ],
          });
        } catch (addError) {
          toast({
            title: "Error",
            description: "Failed to add ARC Testnet network",
            variant: "destructive",
          });
        }
      }
    }
  };

  const connect = async (walletType = 'metamask') => {
    try {
      let ethereum = window.ethereum;

      if (walletType === 'okx' && window.okxwallet) {
        ethereum = window.okxwallet;
      } else if (walletType === 'bitget' && window.bitkeep?.ethereum) {
        ethereum = window.bitkeep.ethereum;
      } else if (walletType === 'rabby' && window.rabby) {
        ethereum = window.rabby;
      }

      if (!ethereum) {
        toast({
          title: "Wallet Not Found",
          description: `Please install ${walletType} wallet`,
          variant: "destructive",
        });
        return;
      }

      const browserProvider = new BrowserProvider(ethereum);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== ARC_TESTNET.chainId) {
        await switchNetwork();
      }

      setAccount(address);
      setProvider(browserProvider);

      const casinoContract = new Contract(
        CONTRACTS.CASINO_GAMES.address,
        CONTRACTS.CASINO_GAMES.abi,
        signer
      );
      setCasinoGamesContract(casinoContract);

      const treasury = new Contract(
        CONTRACTS.TREASURY.address,
        CONTRACTS.TREASURY.abi,
        signer
      );
      setTreasuryContract(treasury);

      const rng = new Contract(
        CONTRACTS.RNG.address,
        CONTRACTS.RNG.abi,
        signer
      );
      setRngContract(rng);

      const bal = await browserProvider.getBalance(address);
      setBalance(formatEther(bal));

      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setCasinoGamesContract(null);
    setTreasuryContract(null);
    setRngContract(null);
    setBalance('0');
    
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (account && accounts[0] !== account) {
          connect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        connect,
        disconnect,
        switchNetwork,
        casinoGamesContract,
        treasuryContract,
        rngContract,
        balance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
    bitkeep?: any;
    rabby?: any;
  }
}
