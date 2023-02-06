const ethers = require("ethers");
const { HYPERSPACE_RPC_URL, DEAL_ABI, DEAL_BYTECODE } = require("./constants");

const PK = "589e4d13ab5d2870644b1cbf94390df214da0ee9fc729362bc3238c6c776afa9";
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

const sendNotification = async(node, body) => {
    try {
      const apiResponse = await PushAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `Deal Incoming`,
          body: `You have a new deal!`
        },
        payload: {
          title: "Deal Incoming",
          body: body,
          cta: '',
          img: ''
        },
        channel: 'eip155:5:0x9aAab7605F4a7E687d8706474ab867284859A0d3', // channel address
        recipients: `eip155:5:${node}`, // recipient address
        env: 'staging'
      });
      
      // apiResponse?.status === 204, if sent successfully!
      console.log('API repsonse: ', apiResponse);
    } catch (err) {
      console.error('Error: ', err);
    }
  }

async function deploy(
    userAddress, 
    dealDuration,
    hourlySegmentReward, 
    totalFinalReward,
    dailySchedule,
    verifier,
    poRep,
    chosenNodes
) {
    const provider =  new ethers.providers.JsonRpcProvider(HYPERSPACE_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("wallet")
    const StorageDeal = new ethers.ContractFactory(DEAL_ABI, DEAL_BYTECODE, wallet);
    console.log("here");
    const res = await StorageDeal.deploy(
        userAddress, 
        dealDuration,
        hourlySegmentReward, 
        totalFinalReward,
        dailySchedule,
        verifier,
        poRep,
    );
    console.log("res");

    // const body = ```User: ${userAddress}\nDeal Duration: ${dealDuration}\nHourly Segment Reward ${hourlySegmentReward}\nTotal Final Reward ${totalFinalReward}```

    // chosenNodes.forEach(node => sendNotification(node, body))

    return res;
}

module.exports = {
    deploy,
};

// (async function() {
//     await deploy(
//         "0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85",
//         1,
//         100,
//         ethers.utils.parseEther("1"),
//         [...Array(24).keys()].map(() => ["0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85"]),
//         "0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85",
//         "",
//     );
// })();