import * as PushAPI from "@pushprotocol/restapi";
import * as ethers from "ethers";

// const PK = process.env.PRIVATE_KEY; // channel private key
const PK = "589e4d13ab5d2870644b1cbf94390df214da0ee9fc729362bc3238c6c776afa9";
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

const sendNotification = async() => {
  try {
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // target
      identityType: 2, // direct payload
      notification: {
        title: `AcceptDeal #123`,
        body: `Deal details...`
      },
      payload: {
        title: `AcceptDeal #123`,
        body: `Deal details...`,
        cta: '',
        img: ''
      },
      channel: 'eip155:5:0x9aAab7605F4a7E687d8706474ab867284859A0d3', // channel address
      recipients: 'eip155:5:0xdD6E8b7c1125565ADA47Fc4313A5b4be96ab18C3', // recipient address
      env: 'staging'
    });
    
    // apiResponse?.status === 204, if sent successfully!
    console.log('API repsonse: ', apiResponse);
  } catch (err) {
    console.error('Error: ', err);
  }
}

sendNotification();