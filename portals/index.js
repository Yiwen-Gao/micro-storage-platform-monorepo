const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuid } = require('uuid');
const {  activateNode, getRating, getWeightedRating, } = require("./micro-node-registry");

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

      activateNode(req.body.walletAddress);
  
      res.status(201).send({ id: node.id, message: "Node registered successfully" });
    } catch (error) {
      console.error(`Error inserting node: ${error.stack}`);
      res.status(500).send("Error registering node");
    }
});

  app.get("/nodes", async (req, res) => {
    try {
      const nodesArray = await nodes.find({}).toArray();
      console.log(`Retrieved ${nodesArray.length} nodes successfully`);
      res.status(200).json(nodesArray);
    } catch (error) {
      console.error("Error getting nodes: ", error);
      res.status(500).send("Error getting nodes");
    }
  });

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on port ${port}`));
