const ethers = require("ethers");
const args = require("yargs")
    .string("contract-address")
    .argv;
const exec = require("child_process").exec;
const { HYPERSPACE_RPC_URL, DEAL_ABI, HISTORY_ABI } = require("./constants");

async function main() {
    const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL);
    const wallet = new ethers.Wallet(args["private-key"], provider);
    const deal = new ethers.Contract(args["contract-address"], DEAL_ABI, wallet);

    const historyAddress = await deal.proofHistory();
    const history = new ethers.Contract(historyAddress, HISTORY_ABI, wallet);

    const day = await deal.getCurrDay();
    const hour = await deal.getCurrHour();
    const sectorCount = await deal.getSectorCount();
    const sectors = new Map();
    for (let i = 0; i < sectorCount; i++) {
        const node = await deal.dailySchedule(hour, i);
        if (sectors.has(node)) {
            sectors.set(node, sectors.get(node) + 1);
        } else {
            sectors.set(node, 1);
        }
    }

    const results = [];
    sectors.forEach((count, node) => {
        results.push(
            verifyNode(deal, history, node, day, hour, count)
        );
    });
    await Promise.all(results);
}

async function verifyNode(deal, history, node, day, hour, sectorCount) {
    const results = [];
    for (let i = 0; i < sectorCount; i++) {
        const sectorID = i + 1;
        results.push(verifySector(history, node, day, hour, sectorID));
    }

    await Promise.all(results);
    const acceptedSectorIDs = [];
    const rejectedSectorIDs = [];

    results.forEach((isValid, i) => {
        const sectorID = i + 1;
        if (isValid) {
            acceptedSectorIDs.push(sectorID);
        } else {
            rejectedSectorIDs.push(sectorID);
        }
    });
    return deal.rewardPoSts(node, day, hour, acceptedSectorIDs, rejectedSectorIDs);
}

function verifySector(history, node, day, hour, sectorID) {
    return history
        .getProofKey(node, day, hour, sectorID)
        .then((key) => history.history(key))
        .then((log) => {
            console.log("log", log);
            return new Promise((resolve, reject) => {
                resolve(true);
                // exec(
                //     `./lotus-worker verifyPost ${node} ${sectorID} ${log.commR} ${log.proof} ${byteSize}`, 
                //     { encoding: "utf-8" },
                //     (error, stdout, stderr) => {
                //         if (error) {
                //             reject(`unable to execute lotus worker: ${error}`);
                //         }
                //         console.log("node:", node, "sector:", sectorID, "result:", stdout ? stdout : stderr);
                //         resolve(stdout ? stdout : stderr); 
                //     }
                // );
            });
        })
        .then((result) => Boolean(result))
        .catch((error) => console.log("unable to verify sector:", error));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });