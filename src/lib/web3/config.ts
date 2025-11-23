export const ARC_TESTNET = {
  chainId: 5042002,
  name: 'Arc Testnet',
  currency: 'USDC',
  rpcUrl: 'https://rpc.testnet.arc.network',
  blockExplorer: 'https://testnet.arcscan.app',
};

export const CONTRACTS = {
  TREASURY: {
    address: '0x7868D6B247dBFE9C6d7b53479aa5465722424159',
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "game",
            "type": "address"
          }
        ],
        "name": "approveGameContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Deposit",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "name": "GameContractApproved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "name": "GameContractRemoved",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "ownerWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "payout",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Payout",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "game",
            "type": "address"
          }
        ],
        "name": "removeGameContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "Withdraw",
        "type": "event"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "approvedGameContracts",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  RNG: {
    address: '0xe0dDaB97205B70F99C88A73Dd55c6ab3DaCFd105',
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "oldOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnerChanged",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "maxNumber",
            "type": "uint256"
          }
        ],
        "name": "random",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "max",
            "type": "uint256"
          }
        ],
        "name": "randomRange",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "caller",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "min",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "max",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "result",
            "type": "uint256"
          }
        ],
        "name": "RandomRangeRequested",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "caller",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "maxNumber",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "result",
            "type": "uint256"
          }
        ],
        "name": "RandomRequested",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "setOwner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  CASINO_GAMES: {
    address: '0x0567b331fAb0BAA93fF18919498956555cA14B0b',
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "game",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "payout",
            "type": "uint256"
          }
        ],
        "name": "GameResult",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "betOn",
            "type": "uint8"
          }
        ],
        "name": "playBaccarat",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "guess",
            "type": "uint8"
          }
        ],
        "name": "playCoinFlip",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "guess",
            "type": "uint8"
          }
        ],
        "name": "playFishPrawnCrab",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "target",
            "type": "uint8"
          }
        ],
        "name": "playLimbo",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8[]",
            "name": "picks",
            "type": "uint8[]"
          },
          {
            "internalType": "uint8",
            "name": "total",
            "type": "uint8"
          }
        ],
        "name": "playMines",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "playPlinko",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "guess",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "max",
            "type": "uint8"
          }
        ],
        "name": "playRange",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "betNumber",
            "type": "uint8"
          }
        ],
        "name": "playRoulette",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint8",
            "name": "playerChoice",
            "type": "uint8"
          }
        ],
        "name": "playRPS",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "playSlots",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "playVideoPoker",
        "outputs": [
          {
            "internalType": "bool",
            "name": "win",
            "type": "bool"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  }
};
