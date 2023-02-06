const fs = require("fs");
const ethers = require("ethers");
const args = require("yargs")
    .string("contract-address")
    .string("sectors")
    .string("proofs")
    .argv;

const { HYPERSPACE_RPC_URL, DEAL_ABI } = require("./constants");

async function main() {
    const contract = args["contract-address"];
    const key = args["private-key"];
    const sectors = args["sectors"].split(",").map((sector) => Number(sector));
    const commRs = args["comm-rs"].split(",");
    const proofs = args["proofs"].split(",").map((proof) => Number(proof));
    const paths = args["bytes"].split(",");
    const bytes = paths.map((path) => {
        const buffer = fs.readFileSync(path);
        return buffer.toString();
    });

    await submit(contract, key, sectors, commRs, proofs, bytes);
}

async function submit(contract, nodePrivateKey, sectors, commRs, proofs, bytes) {
    const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL);
    const wallet = new ethers.Wallet(nodePrivateKey, provider);
    const deal = new ethers.Contract(contract, DEAL_ABI, wallet);
    return await deal.submitPoSts(sectors, commRs, proofs, bytes);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
