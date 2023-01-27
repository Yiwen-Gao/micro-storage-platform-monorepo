// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// This contract stores all the nodes that have registered as part of the platform.
// It tracks their history for a reputation system, which should persist between storage deals and incentivize good behavior.
contract MicroNodeRegistry {
    // If a node has committed to 100 hours for a deal, 50 of the hours have passed, 
    // and the node successfully submitted proofs for 40 of the 50 hours:
    // `fulfilledHours` = 40, `elapsedHours` = 50, so their rating should be 40 / 50 = 80%.
    struct WorkLog {
        uint fulfilledHours;
        uint elapsedHours;
    }

    mapping(address => WorkLog) public history;
    address owner;

    constructor() {
        owner = msg.sender;
    }

    function addHours(address node, uint fulfilledHours, uint elapsedHours) external {
        require(msg.sender == owner, "unauthorized caller");
        require(fulfilledHours <= elapsedHours, "fulfilled hours must be less than elapsed hours");
        WorkLog storage log = history[node];
        log.fulfilledHours += fulfilledHours;
        log.elapsedHours += elapsedHours;
    }

    function getRating(address node) external view returns (uint) {
        WorkLog storage log = history[node];
        require(log.elapsedHours > 0, "no history for node");
        // The rating is a percentage between 0 and 1, but we multiply by 100 because Solidity doesn't allow fractions.
        return log.fulfilledHours / log.elapsedHours * 100;
    }

    // Fulfilled hours can be used to weight the rating. 
    // If two storage providers are competing for the same deal and both have a 90% rating, 
    // but one has completed 100 hours and another has completed 200--we favor the one with the higher number.  
    function getFulfilledHours(address node) external view returns (uint) {
        return history[node].fulfilledHours;
    }
}