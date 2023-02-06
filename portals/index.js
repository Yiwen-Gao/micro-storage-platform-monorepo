const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuid } = require('uuid');
const {  activateNode, getRating, getWeightedRating, } = require("./micro-node-registry");
const {  deploy } = require("./storage-deal");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());

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

app.post("/registerNode", async (req, res) => {
    try {
      const id = uuid();
      const node = { id, ...req.body };
      console.log("MicroNode Wallet Address", req.body.walletAddress);
      await nodes.insertOne(node);
      console.log(`Node with ID ${id} registered successfully`);

      await activateNode(req.body.walletAddress);
  
      res.status(201).send({ id: node.id, message: "Node registered successfully" });
    } catch (error) {
      console.error(`Error inserting node: ${error.stack}`);
      res.status(500).send("Error registering node");
    }
});

  //connect to the collection TemporaryData 
  const temp = db.collection("TemporaryData");
  app.get("/getData", async (req, res) => {
    try {
      const walletAddress = req.query.walletAddress;
      const nodeData = await temp.find({ id: walletAddress }).toArray();
      console.log(`Retrieved  data for Node address: ${walletAddress} successfully`);
      res.status(200).json(nodeData);
    } catch (error) {
      console.error("Error getting nodes: ", error);
      res.status(500).send("Error getting nodes");
    }
  });

  app.use(bodyParser.raw({ type: "application/octet-stream" }));
  app.post('/allocateStorage',async (req, res) => {
    try {
      const nodesArray = await nodes.find({}).toArray();
      console.log(`Retrieved ${nodesArray.length} nodes successfully`);
      res.status(200).json(nodesArray);
    } catch (error) {
      console.error("Error getting nodes: ", error);
      res.status(500).send("Error getting nodes");
    }
  
      let requestedStorage = req.query.storage;
      let requestedFromTime = req.query.fromtime;
      let requestedToTime = req.query.totime;
      let requestedFromDate = req.query.fromdate;
      let requestedToDate = req.query.todate;
      let userAddress = req.query.address;
      let hourlySegmentReward = req.query.hourlySegmentReward;
      let totalFinalReward = req.query.totalFinalReward;
      const fileBytes = req.body;
      const dealDuration = findDaysBetweenDates(requestedFromDate,requestedToDate);

      const findDaysBetweenDates = (startDate, endDate) => {
        const start = new Date(requestedFromDate);
        const end = new Date(requestedToDate);
        const timeDiff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
  
      //filter nodes based on start,end date and time 
      const availableNodes = nodesArray.filter(node => node.availability.startDate <= requestedFromDate && 
          node.availability.endDate >= requestedEndDate && node.availability.startTime <= requestedFromTime && node.availability.endTime >= requestedEndTime && 
          storageAmount >= 2);
  
        // Sort nodes based on rating from smart contract
        availableNodes.sort((a, b) => {
              const aRating =  getRating(a.id);
              const bRating =  getRating(b.id);
  
              // Sort based on ratings
              if (aRating !== bRating) {
                  return bRating - aRating;
              } else {
                  // In case of a tie, sort based on fulfillment hours
                  const aFullfillmentHours = getWeightedRating(a.id);
                  const bFullfillmentHours = getWeightedRating(b.id);
                  return bFullfillmentHours - aFullfillmentHours;
      }
    });
    const sectorSize = 512 * 1024 * 1024; // size of each sector in Bytes
    const sectorsNum = Math.ceil(storage * 1024 * 1024 * 1024 / sectorSize); // number of sectors required

    // Create the 2D array for allocation
    let allocationArray = [];
    for (let i = 0; i < 24; i++) {
      allocationArray[i] = new Array(sectorsNum);
    }

    //chosen nodes 
    let chosenNodes = [];
  
    //data in bytes to be sent to each node 
    let chunks = [][sectorsNum];
    let i=0;
    let dataLeft = requestedStorage;
  
    //assigning nodes for each sector , every hour
    for (let hour = 0; hour < 24; hour++) {
        //iterate through nodes array to find the suitable one
        let nodeIndex = 0;
        while(nodeIndex < availableNodes.length && dataLeft > 0) {
          if (!availableNodes[nodeIndex].storageAmount) {
              nodeIndex++;
            }
            if ((availableNodes[nodeIndex].storageAmount) * 1024 * 1024 * 1024 >= (4 * segmentSize)) {
                for (let segment = 0; segment < sectorsNum; segment++) {
                    allocationArray[hour][segment] = availableNodes[nodeIndex].walletAddress;
                    chosenNodes.push(availableNodes[nodeIndex].walletAddress);
                    let start = segment * sectorSize;
                    let end = Math.min(start + sectorSize - 1, fileBytes - 1);
                    chunks[i].push(fileBytes.slice(start, end + 1));
            }
            availableNodes[nodeIndex].storageAmount -= 2;
            dataLeft-= 2;
            nodeIndex++;
            i++;
           } else {
              nodeIndex++;
            }
      }
  }
  
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
      console.log("Node ratings updated successfully");
      } catch (error) {
      console.error("Error updating node ratings: ${error.stack}");
      }

    //todo: deploy storage deal contract (porep,..)
    const addressDeployed = await deploy(userAddress,dealDuration,hourlySegmentReward,totalFinalReward,allocationArray,
      "0xbcb8E197F783E2aE4B3f3b6358B582a9692f9F85","");

    //store data temporarily in mongo db
    try {
      for(let i=0;i<chosenNodes.length;i++) {
        const dataToSend = {
          id: chosenNodes[i],
          data: chunks[i],
          storage_deal_address: addressDeployed
        }
      await temp.insertOne(dataToSend);
      console.log(`Data for node ID ${id} added successfully`);
    }
    res.status(201).send({ message: "Data added in DB temporarily" });
   } catch (error) {
      console.error(`Error inserting node: ${error.stack}`);
      res.status(500).send("Error sending data to DB");
    } 
  });  
  

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on port ${port}`));
