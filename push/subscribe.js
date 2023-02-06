import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";

const PK = process.env.PRIVATE_KEY; // micro-node private key

const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

await PushAPI.channels.subscribe({
    signer: signer,
    channelAddress: 'eip155:5:0x9aAab7605F4a7E687d8706474ab867284859A0d3', // channel address in CAIP
    userAddress: 'eip155:5:0xdD6E8b7c1125565ADA47Fc4313A5b4be96ab18C3', // micro-node address in CAIP
    onSuccess: () => {
     console.log('opt in success');
    },
    onError: () => {
      console.error('opt in error');
    },
    env: 'staging'
  })
