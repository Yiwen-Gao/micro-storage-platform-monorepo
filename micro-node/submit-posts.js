const fs = require("fs");
const ethers = require("ethers");
const args = require("yargs").argv;

const { HYPERSPACE_RPC_URL, DEAL_ABI } = require("./constants");

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
