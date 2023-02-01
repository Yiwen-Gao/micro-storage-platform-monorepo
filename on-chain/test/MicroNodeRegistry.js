const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MicroNodeRegistry contract", function() {
    it("should only allow owner to add hours", async function() {
        const [_, other] = await ethers.getSigners();
        const MicroNodeRegistry = await ethers.getContractFactory("MicroNodeRegistry");
        const registry = await MicroNodeRegistry.deploy();

        await expect(registry.connect(other).addHours(other.address, 1, 1)).to.be.reverted;
    });

    it("should calculate node reputation", async function() {
        const [_, node1, node2] = await ethers.getSigners();
        const MicroNodeRegistry = await ethers.getContractFactory("MicroNodeRegistry");
        const registry = await MicroNodeRegistry.deploy();

        registry.addHours(node1.address, 1, 2);
        expect(await registry.getRating(node1.address)).to.equal(50);
        expect(await registry.getFulfilledHours(node1.address)).to.equal(1);
        
        await expect(registry.getRating(node2.address)).to.be.reverted;
        expect(await registry.getFulfilledHours(node2.address)).to.equal(0);
    });
});