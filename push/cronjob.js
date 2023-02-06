import * as cron from "node-cron";
import * as PushAPI from "@pushprotocol/restapi";

const getNotifs = async () => {
    const notifications = await PushAPI.user.getFeeds({
        user: 'eip155:5:0xdD6E8b7c1125565ADA47Fc4313A5b4be96ab18C3', // user address in CAIP
        env: 'staging'
    });
    return notifications[0];
}

let lastNotifMsg = "";

cron.schedule('*/1 * * * *', async () => {
    const recentNotif = await getNotifs();
    if (recentNotif.message != lastNotifMsg) {
        lastNotifMsg = recentNotif.message;
        console.log(recentNotif);
        // call data endpoint
        // seal it off
        // submit windowed proofs
    }
});