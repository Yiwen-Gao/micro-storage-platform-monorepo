const { ethers } = require("hardhat");

async function main(clientAddress, nodeSchedule, dealDuration) {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
    
    const StorageDeal = await ethers.getContractFactory("StorageDeal", wallet);
    const deal = await StorageDeal.deploy(clientAddress, nodeSchedule, dealDuration);
    console.log("Contract address:", deal.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

exports.deploy = main;