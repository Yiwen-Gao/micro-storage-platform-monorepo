const ethers = require("ethers");
const { HYPERSPACE_RPC_URL, REGISTRY_ADDRESS, REGISTRY_ABI } = require("./constants");
const {channels} = require("@pushprotocol/restapi")

const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);

async function activateNode(address, pkey) {
    try {
        await registry.activateNode(address);
        console.log(`Node with address ${address} activated successfully`);

        const signer = new ethers.Wallet(pkey);

        await channels.subscribe({
            signer: signer,
            channelAddress: 'eip155:5:0x9aAab7605F4a7E687d8706474ab867284859A0d3', // channel address in CAIP
            userAddress: `eip155:5:${address}`, // micro-node address in CAIP
            onSuccess: () => {
             console.log('opt in success');
            },
            onError: () => {
              console.error('opt in error');
            },
            env: 'staging'
          })
    } catch (error) {
        console.error(`Error activating node: ${error.stack}`);
    }
}


async function getRating(address) {
    return await registry.getRating(address);
}

async function getWeightedRating(address) {
    const [rating, weight] = await Promise.all([
        registry.getRating(address),
        registry.getFulfilledHours(address),
    ]);
    return rating * weight;
}

module.exports = {
    activateNode,
    getRating,
    getWeightedRating,
};