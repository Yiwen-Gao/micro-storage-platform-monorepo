const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuid } = require('uuid');
const {  activateNode, getRating, getWeightedRating, } = require("./micro-node-registry");
const {  deploy } = require("./storage-deal");
const bodyParser = require("body-parser");
const app = express();
const ethers = require("ethers");
app.use(express.json());

const { findDaysBetweenDates } = require("./utils");

const uri = "mongodb+srv://micronodeserver:windowpost@micronodedb.qlphatj.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDb() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(`Error connecting to database: ${error.stack}`);
  }
}
connectToDb();

const db = client.db("MicroNodes");
const nodes = db.collection("MicroNodeDetails");

const SECTOR_BYTE_SIZE = 512 * 1024 * 1024; // size of each sector in Bytes

// app.post("/registerNode", async (req, res) => {
// //     try {
// //       const id = uuid();
// //       const node = { id, ...req.body, storageAmount: parseInt(req.body.storageAmount) };
// //       console.log("MicroNode Wallet Address", req.body.walletAddress);
// //       await nodes.insertOne(node);
// //       console.log(`Node with ID ${id} registered successfully`);

// //       await activateNode(req.body.walletAddress);
  
// //       res.status(201).send({ id: node.id, message: "Node registered successfully" });
// //     } catch (error) {
// //       console.error(`Error inserting node: ${error.stack}`);
// //       res.status(500).send("Error registering node");
// //     }
// // });

// //   //connect to the collection TemporaryData 
// //   const temp = db.collection("TemporaryData");
// //   app.get("/getData", async (req, res) => {
// //     try {
// //       const walletAddress = req.query.walletAddress;
// //       const nodeData = await temp.find({ id: walletAddress }).toArray();
// //       console.log(`Retrieved  data for Node address: ${walletAddress} successfully`);
// //       res.status(200).json(nodeData);
// //     } catch (error) {
// //       console.error("Error getting nodes: ", error);
// //       res.status(500).send("Error getting nodes");
// //     }
// //   });

//   app.use(bodyParser.raw({ type: "application/octet-stream" }));
app.post('/allocateStorage', async (req, res) => {
  let nodesArray = []
  try {
    nodesArray = await nodes.find({}).toArray();
    console.log(`Retrieved ${nodesArray.length} nodes successfully`);
  } catch (error) {
    console.error("Error getting nodes: ", error);
    res.status(500).send("Error getting nodes");
    return;
  }

  console.log("nodes array", nodesArray);
  let { 
    storage, 
    requestedFromDate, 
    requestedToDate, 
    userAddress, 
    hourlySegmentReward, 
    totalFinalReward,
    fileBytes,
  } = req.body;

  const startDate = new Date(requestedFromDate);
  const endDate = new Date(requestedToDate);
  console.log("dates", startDate, endDate);
  const dealDuration = findDaysBetweenDates(startDate, endDate);   
  console.log("deal duration", dealDuration);
    
  const sectorsNum = Math.ceil(storage * 1024 * 1024 * 1024 / SECTOR_BYTE_SIZE); // number of sectors required
  console.log("sectorsNum", sectorsNum);
  // Create the 2D array for allocation
  const empty = [...Array(sectorsNum).keys()].map(() => "");
  let allocationArray = [...Array(24).keys()].map(() => empty);

  let chosenNodes = [];
  
  //data in bytes to be sent to each node 
  let chunks = [];
  //assigning nodes for each sector , every hour
  // Possible values: start time = 0 - 23, end time = 1 - 24
  for (let hour = 0; hour < allocationArray.length; hour++) {
    let availableNodes = nodesArray.filter(node => {
      return (
        new Date(node.availability.startDate) <= startDate && 
        new Date(node.availability.endDate) >= endDate  && 
        parseInt(node.storageAmount) >= 2 && parseInt(node.availability.startTime) <= hour && 
        parseInt(node.availability.endTime) > (hour)
      );
    });

    availableNodes.sort((a, b) => {
      const aRating =  getRating(a.walletAddress);
      const bRating =  getRating(b.walletAddress);

      // Sort based on ratings
      if (aRating !== bRating) {
        return bRating - aRating;
      } else {
        // In case of a tie, sort based on weighted ratings.
        return getWeightedRating(b.walletAddress) - getWeightedRating(a.walletAddress);
      }
    });

    let sectorIdx = 0, nodeIdx = 0;
    while (sectorIdx < allocationArray[hour].length) {
      const node = availableNodes[nodeIdx];
      console.log("node", node);
      let innerArray = Array(node.storageAmount * 2).fill(0);
      for (let i = 0; i < node.storageAmount * 2; i++) { // GiB? 1 GiB = 2 * 512 MiB so 2 GiB = 4 * 512 MiB
        allocationArray[hour][sectorIdx++] = String(node.walletAddress);
        let start = sectorIdx * SECTOR_BYTE_SIZE;
        let end = Math.min(start + SECTOR_BYTE_SIZE - 1, fileBytes - 1);
        innerArray.push(fileBytes.slice(start, end + 1));

        if (sectorIdx == sectorsNum) {
          break;
        }
      }
          
      chosenNodes.push(node.walletAddress);
      chunks.push(innerArray);        
      nodeIdx++;
    }
  }

  // Deploy new storage deal on chain.
  await deploy(
    userAddress,
    parseInt(dealDuration),
    parseInt(hourlySegmentReward),
    parseInt(totalFinalReward),
    allocationArray,
    "0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85",
    "",
  );
  console.log("Deployed new storage deal on chain");
  
  //update node storage 
  const updatedNodes = availableNodes.map(node => {
      return {
        updateOne: {
          filter: { walletAddress: node.walletAddress },
          update: { $set: { storageAmount: node.storageAmount,
                            startDate: addOneDay(requestedToDate) } }
        }
      };
    });

    try {
      await nodes.bulkWrite(updatedNodes);
      console.log("Node storage updated successfully");
    } catch (error) {
      console.error("Error updating node storage: ${error.stack}");
    }

  //   //store data temporarily in mongo db
  //   try {
  //     for (let i=0;i<chosenNodes.length;i++) {
  //       const dataToSend = {
  //         id: chosenNodes[i],
  //         data: chunks[i],
  //         storage_deal_address: addressDeployed
  //       }
  //     await temp.insertOne(dataToSend);
  //     console.log(`Data for node ID ${id} added successfully`);
  //   }
  //   res.status(201).send({ message: "Data added in DB temporarily" });
  //  } catch (error) {
  //     console.error(`Error inserting node: ${error.stack}`);
  //     res.status(500).send("Error sending data to DB");
  //   }   

  res.status(201).send({ message: "Data added in DB temporarily" });
});
  
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on port ${port}`));
