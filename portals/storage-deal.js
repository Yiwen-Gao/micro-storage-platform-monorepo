const ethers = require("ethers");
const { HYPERSPACE_RPC_URL, DEAL_ABI, DEAL_BYTECODE } = require("./constants");

async function deploy(
    userAddress, 
    dealDuration,
    hourlySegmentReward, 
    totalFinalReward,
    dailySchedule,
    verifier,
    poRep,
) {
    const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL) ;
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const StorageDeal = new ethers.ContractFactory(DEAL_ABI, DEAL_BYTECODE, wallet);
    return await StorageDeal.deploy(
        userAddress, 
        dealDuration,
        hourlySegmentReward, 
        totalFinalReward,
        dailySchedule,
        verifier,
        poRep,
    );
}

module.exports = {
    deploy,
};