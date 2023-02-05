const { ethers } = require("hardhat");

async function main(
    userAddress, 
    dealDuration,
    hourlySegmentReward, 
    totalFinalReward,
    dailySchedule,
    verifier,
    poRep,
) {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
    
    const StorageDeal = await ethers.getContractFactory("StorageDeal", wallet);
    const deal = await StorageDeal.deploy(
        userAddress,  
        dealDuration,
        hourlySegmentReward, 
        totalFinalReward,
        dailySchedule,
        verifier,
        poRep,
    );
    console.log("Contract address:", deal.address);
}

// NOTE replace the addresses with your own.
main(
    "0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85",
    5,
    ethers.utils.parseEther("1"),
    ethers.utils.parseEther("1").mul(10),
    [...Array(24).keys()].map(() => ["0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85"]),
    "0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85",
    "",
)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

exports.deploy = main;