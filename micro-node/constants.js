const HYPERSPACE_RPC_URL = "https://api.hyperspace.node.glif.io/rpc/v1";
const DEAL_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_dealDuration",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_hourlySegmentReward",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_totalFinalReward",
        "type": "uint256"
      },
      {
        "internalType": "address[][24]",
        "name": "_dailySchedule",
        "type": "address[][24]"
      },
      {
        "internalType": "address",
        "name": "_proofVerifier",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "poRep",
        "type": "string"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "dailySchedule",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endDeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrDay",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrHour",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSectorCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "participants",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isParticipant",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "fulfillments",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "commitments",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proofHistory",
    "outputs": [
      {
        "internalType": "contract ProofHistory",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "oldNode",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "newNode",
        "type": "address"
      }
    ],
    "name": "replaceNode",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "currDay",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currHour",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "acceptedSectors",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "rejectedSectors",
        "type": "uint256[]"
      }
    ],
    "name": "rewardPoSts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startDeal",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[]",
        "name": "sectors",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "commRs",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "proofNums",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "proofBytes",
        "type": "string[]"
      }
    ],
    "name": "submitPoSts",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const HISTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_poRep",
        "type": "string"
      },
      {
        "internalType": "address[][24]",
        "name": "_dailySchedule",
        "type": "address[][24]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "hour",
        "type": "uint256"
      }
    ],
    "name": "poStSubmission",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hour",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "sectors",
        "type": "uint256[]"
      }
    ],
    "name": "acceptProofs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "dailySchedule",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hour",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "sector",
        "type": "uint256"
      }
    ],
    "name": "getProofKey",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "history",
    "outputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "sector",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "commR",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "proofNum",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "proofBytes",
        "type": "string"
      },
      {
        "internalType": "enum ProofHistory.Status",
        "name": "status",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poRep",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hour",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "sectors",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "commRs",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "proofNums",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "proofBytes",
        "type": "string[]"
      }
    ],
    "name": "recordPoStSubmission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "day",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "hour",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "sectors",
        "type": "uint256[]"
      }
    ],
    "name": "rejectProofs",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

module.exports = {
    HYPERSPACE_RPC_URL,
    DEAL_ABI,
    HISTORY_ABI,
};