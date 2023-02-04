const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
    
    const ProofVerifier = await ethers.getContractFactory("ProofVerifier", wallet);
    const verifier = await ProofVerifier.deploy();
    console.log("Contract address:", verifier.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });