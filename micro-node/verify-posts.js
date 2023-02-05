const ethers = require("ethers");
const args = require("yargs").argv;
const { HYPERSPACE_RPC_URL, DEAL_ABI, HISTORY_ABI } = require("./constants");

async function main() {
    const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL);
    const wallet = new ethers.Wallet(args["private-key"], provider);
    const deal = new ethers.Contract(args["deal-address"], DEAL_ABI, wallet);

    const historyAddress = await deal.proofHistory();
    const history = await ethers.Contract(historyAddress, HISTORY_ABI, wallet);

    const day = await deal.getCurrDay();
    const hour = await deal.getCurrHour();
    const scheduledNodes = await deal.dailySchedule(hour);
    const sectors = new Map();
    scheduledNodes.forEach((node) => {
        if (sectors.has(node)) {
            sectors.set(node, sectors.get(node) + 1);
        } else {
            sectors.set(node, 1);
        }
    });

    const results = [];
    sectors.forEach((node, sectorNum) => {
        results.push(
            verifyNode(deal, history, node, day, hour, [...Array(sectorNum).keys()])
        );
    });
    await Promise.all(results);
}

async function verifyNode(deal, history, node, day, hour, sectorIDs) {
    const results = await Promise.all(
        sectorIDs.map((sectorID) => {
            return verifySector(history, node, day, hour, sectorID);
        }
    ));

    const acceptedSectorIDs = [];
    const rejectedSectorIDs = [];
    results.forEach((isValid, idx) => {
        const id = idx + 1;
        if (isValid) {
            acceptedSectorIDs.push(id);
        } else {
            rejectedSectorIDs.push(id);
        }
    });
    return deal.rewardPoSts(node, day, hour, acceptedSectorIDs, rejectedSectorIDs);
}

function verifySector(history, node, day, hour, sectorID) {
    return history
            .getProofKey(node, day, hour, sectorID)
            .then((key) => history.history(key))
            .then((log) => {
                // TODO call bash script with log contents.
            });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });