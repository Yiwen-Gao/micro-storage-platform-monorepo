const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("MicroNodeRegistry contract", function() {
    async function deploy() {
        const [owner, node1] = await ethers.getSigners();
        const MicroNodeRegistry = await ethers.getContractFactory("MicroNodeRegistry");
        const registry = await MicroNodeRegistry.deploy();

        return { owner, node1, registry };
    }

    it("should only allow owner to activate and deactivate nodes", async function() {
        const { node1, registry } = await loadFixture(deploy);

        await expect(registry.connect(node1).activateNode(node1.address)).to.be.reverted;
        await expect(registry.connect(node1).deactivateNode(node1.address)).to.be.reverted;
    });

    it("should give defaults if no work history", async function() {
        const { node1, registry } = await loadFixture(deploy);

        await registry.activateNode(node1.address);
        expect(await registry.getRating(node1.address)).to.be.equal(90);
        expect(await registry.getFulfilledHours(node1.address)).to.equal(1);
    })

    it("should calculate reputation based on hours", async function() {
        const { node1, registry } = await loadFixture(deploy);

        await registry.activateNode(node1.address);
        await registry.addHours(node1.address, 1, 2);
        expect(await registry.getRating(node1.address)).to.equal(50);
        expect(await registry.getFulfilledHours(node1.address)).to.equal(1);
    });
});