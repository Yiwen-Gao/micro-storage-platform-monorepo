// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";

// This contract stores all the nodes that have registered as part of the platform.
// It tracks their history for a reputation system, which should persist between storage deals and incentivize good behavior.
contract MicroNodeRegistry {
    // If a node has committed to 100 hours for a deal, 50 of the hours have passed, 
    // and the node successfully submitted proofs for 40 of the 50 hours:
    // `fulfilledHours` = 40, `elapsedHours` = 50, so their rating should be 40 / 50 = 80%.
    struct WorkLog {
        bool isActive;
        uint fulfilledHours;
        uint elapsedHours;
    }

    mapping(address => WorkLog) public history;
    address owner;

    constructor() {
        owner = msg.sender;
    }

    function activateNode(address node) external {
        require(msg.sender == owner, "unauthorized caller");
        history[node].isActive = true;
    }

    function deactivateNode(address node) external {
        require(msg.sender == owner, "unauthorized caller");
        history[node].isActive = false;
    }

    function addHours(address node, uint fulfilledHours, uint elapsedHours) external {
        require(msg.sender == owner, "unauthorized caller");
        require(history[node].isActive, "node is currently inactive");
        require(fulfilledHours <= elapsedHours, "fulfilled hours must be less than elapsed hours");

        WorkLog storage log = history[node];
        log.fulfilledHours += fulfilledHours;
        log.elapsedHours += elapsedHours;
    }

    function getRating(address node) external view returns (uint) {
        WorkLog storage log = history[node];
        require(log.isActive, "node is currently inactive");
        if (log.elapsedHours == 0) {
            // If the node has no work history yet, we assign a default rating of 90, 
            // which we assume will be the average rating among existing nodes.
            return 90;
        }
        // We have to multiply the rating by 100 because Solidity doesn't allow fractions.
        // This means it'll be an integer between 0 and 100.
        console.log("getRating", log.fulfilledHours, log.elapsedHours);
        return 100 * log.fulfilledHours / log.elapsedHours;
    }

    // Fulfilled hours can be used to weight the rating. 
    // If two storage providers are competing for the same deal and both have a 90% rating, 
    // but one has completed 100 hours and another has completed 200--we favor the one with the higher number.  
    function getFulfilledHours(address node) external view returns (uint) {
        WorkLog storage log = history[node];
        require(log.isActive, "node is currently inactive");
        if (log.elapsedHours == 0) {
            // If the node has no work history yet, we return a default of 1, 
            // otherwise the weighted rating will be 0 * 90 = 0.
            return 1;
        }
        return history[node].fulfilledHours;
    }
}