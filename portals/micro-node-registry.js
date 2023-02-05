const ethers = require("ethers");

const RPC_URL = "https://api.hyperspace.node.glif.io/rpc/v1";
const REGISTRY_ADDRESS = "0x97b4596C27c082e9E647002515351828C067D244";
const REGISTRY_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "node",
        "type": "address"
      }
    ],
    "name": "activateNode",
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
        "name": "fulfilledHours",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "elapsedHours",
        "type": "uint256"
      }
    ],
    "name": "addHours",
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
      }
    ],
    "name": "deactivateNode",
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
      }
    ],
    "name": "getFulfilledHours",
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
        "name": "node",
        "type": "address"
      }
    ],
    "name": "getRating",
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
    "name": "history",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "fulfilledHours",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "elapsedHours",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function getRegistry() {
    const provider =  new ethers.providers.JsonRpcProvider(RPC_URL) ;
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);
    return registry;
}

async function getRating(address) {
    const registry = getRegistry();
    await registry.activateNode(address);
    console.log(await registry.getRating(address));
}

module.exports = {
    getRating,
};