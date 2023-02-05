const ethers = require("ethers");
const { HYPERSPACE_RPC_URL, REGISTRY_ADDRESS, REGISTRY_ABI } = require("./constants");

const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL) ;
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);

async function activateNode(address) {
    await registry.activateNode(address);
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