const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StorageDeal contract", function() {
    const oneEth = ethers.utils.parseEther("1");

    async function deploy() {
        const [owner, user, verifier, node1, node2, node3] = await ethers.getSigners();
        const StorageDeal = await ethers.getContractFactory("StorageDeal");
        const deal = await StorageDeal.deploy(
            user.address,
            5,
            oneEth,
            oneEth.mul(10),
            [...Array(24).keys()].map(() => [node1.address, node2.address, node3.address]),
            verifier.address,
            "",
        );

        // Total reward is calculated by (24 h / day * 1 eth / segment * 3 segments / h * 5 days) + 10 eth.
        const totalReward = oneEth.mul((24 * 1 * 3 * 5) + 10);
        await expect(deal.startDeal({ value: totalReward })).to.be.reverted;
        await deal.connect(user).startDeal({ value: totalReward });

        return { deal, owner, user, verifier, node1, node2, node3, totalReward };
    }

    it("should set up and start deal", async function() {
        const { deal, node1, node2, node3, totalReward } = await loadFixture(deploy);

        for (const node of [node1, node2, node3]) {
            const log = await deal.participants(node.address);
            expect(log.isParticipant).to.be.true;
            expect(log.fulfillments).to.equal(0);
            expect(log.commitments).to.equal(120);
        }
        expect(await ethers.provider.getBalance(deal.address)).to.be.equal(totalReward);
    });

    it("should accept poSt", async function() {
        const { deal, verifier, node1 } = await loadFixture(deploy);
        const day = await deal.getCurrDay();
        const hour = await deal.getCurrHour();

        const address = await deal.proofHistory();
        const ProofHistory = await ethers.getContractFactory("ProofHistory");
        const history = await ProofHistory.attach(address);

        await deal.connect(node1).submitPoSts([1], ["commR"], ["proof"]);
        await expect(deal.connect(verifier).rewardPoSts(node1.address, day, hour, [1], [])).to.changeEtherBalance(node1, oneEth.toString());
        const workLog = await deal.participants(node1.address);
        expect(workLog.isParticipant).to.be.true;
        expect(workLog.fulfillments).to.equal(1);
        expect(workLog.commitments).to.equal(120);

        const key = await history.getProofKey(node1.address, day, hour, 1);
        const proofLog = await history.history(key);
        expect(proofLog.sector).to.equal(1);
        expect(proofLog.commR).to.equal("commR");
        expect(proofLog.proof).to.equal("proof");
    });

    it("should end deal", async function() {
        const { deal, user, verifier, node1, node2, node3, totalReward } = await loadFixture(deploy);

        await deal.connect(node1).submitPoSts([1], ["commR"], ["proof"]);
        const day1 = await deal.getCurrDay();
        const hour1 = await deal.getCurrHour();
        await expect(deal.connect(verifier).rewardPoSts(node1.address, day1, hour1, [1], [])).to.changeEtherBalance(node1, oneEth.toString());
        // Increase the time by an hour.
        await time.increase(60 * 60);
        await deal.connect(node1).submitPoSts([1], ["commR"], ["proof"]);
        await deal.connect(node2).submitPoSts([2], ["commR"], ["proof"]);

        const day2 = await deal.getCurrDay();
        const hour2 = await deal.getCurrHour();
        await expect(deal.connect(verifier).rewardPoSts(node1.address, day2, hour2, [1], [])).to.changeEtherBalance(node1, oneEth.toString());
        await expect(deal.connect(verifier).rewardPoSts(node2.address, day2, hour2, [2], [])).to.changeEtherBalance(node2, oneEth.toString());
        // TODO @ygao readd user account balance assertions.
        // const payment = oneEth.mul(30).div(360).add(3);
        await expect(deal.endDeal()).to.changeEtherBalances(
            [
                // user, 
                node1, 
                node2, 
                node3,
            ],
            [
                // totalReward.sub(payment).toString(), 
                oneEth.mul(20).div(360).toString(), 
                oneEth.mul(10).div(360).toString(), 
                "0",
            ],
        );
        expect(await ethers.provider.getBalance(deal.address)).to.be.equal(0);

        const log1 = await deal.participants(node1.address);
        expect(log1.fulfillments).to.be.equal(2);        
        
        const log2 = await deal.participants(node2.address);
        expect(log2.fulfillments).to.be.equal(1);

        const log3 = await deal.participants(node3.address);
        expect(log3.fulfillments).to.be.equal(0);
    });
});