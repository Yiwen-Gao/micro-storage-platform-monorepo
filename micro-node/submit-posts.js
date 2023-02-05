const fs = require("fs");
const ethers = require("ethers");
const args = require("yargs").argv;

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
          "name": "acceptedMicroSectors",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "rejectedMicroSectors",
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
          "internalType": "string[]",
          "name": "proofs",
          "type": "string[]"
        }
      ],
      "name": "submitPoSts",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

async function main() {
    const contract = args["contract-address"];
    const key = args["private-key"];
    const sectors = args["sectors"].split(",").map((sector) => Number(sector));
    const commRs = args["comm-rs"].split(",");
    const paths = args["proof-files"].split(",");
    const proofs = paths.map((path) => {
        const buffer = fs.readFileSync(path);
        return buffer.toString();
    });

    await submit(contract, key, sectors, commRs, proofs);
}

async function submit(contract, nodePrivateKey, sectors, commRs, proofs) {
    const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL);
    const wallet = new ethers.Wallet(nodePrivateKey, provider);
    const deal = new ethers.Contract(contract, DEAL_ABI, wallet);
    return await deal.submitPoSts(sectors, commRs, proofs);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
