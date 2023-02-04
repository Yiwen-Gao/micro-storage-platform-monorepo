// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./ProofHistory.sol";
import "hardhat/console.sol";

// This contract represents one storage deal. A new instance should be deployed on chain for each deal that's brokered.
contract StorageDeal {
    enum Status { PENDING, IN_PROGRESS, COMPLETE }
    struct WorkLog {
        bool isParticipant;
        // This is the number of fulfilled commitments a node has delivered on. 
        // It'll increase over the duration of the storage deal on successful verification of submitted proofs.
        uint fulfillments;
        // This is the total number of commitments a node has promised for the storage deal.
        // The ratio of a node's fulfillments to commitments can be thought of as "what it delivered" compared to "what it promised".
        // This ratio affects the final reward for the node.
        uint commitments;
    }

    address owner;
    address user;
    // The schedule is a 2D array that describes how the user's data is split amongst the participating nodes in the deal. 
    // The outer array contains 24 inner arrays, one for each hour of the day.
    // An inner array represents how the data is divided between the nodes for the hour.
    // (Each inner array should be the same length, but this will differ for different storage deals based on the user's data size.)
    // If the same node appears in an inner array multiple times, that means it's committed to multiple micro-sectors of the user's data.
    // At the moment, each micro-sector is 512MiB, but this may change in the future.
    //
    // Consider a sample schedule where the user wants to store four micro-sectors of data:
    // Hour of Day    || mSector 1 | mSector 2 | mSector 3 | mSector 4
    // ===============================================================
    // 0 (12AM - 1AM) || node 1    | node 1    | node 1    | node 2
    // 1 (1AM -  2AM) || node 1    | node 2    | node 3    | node 4
    // 2 (2AM -  3AM) || node 2    | node 2    | node 3    | node 4
    // (And so on for the rest of the day...)
    //
    // For the first hour, node1 is storing three of the four micro-sectors and node2 is storing one.
    // If we sum up the commitments for the first three hours, node1: 4, node2: 4, node3 : 2, and node4: 2.
    address[][24] public dailySchedule;
    mapping(address => WorkLog) public participants;

    uint hourlySegmentReward;
    uint totalFinalReward;
    uint startTime;
    uint endTime;
    uint dealDuration; 
    // Some functions can only be called if the deal has a certain status
    Status dealStatus;

    ProofHistory proofHistory;
    address proofVerifier;

    /**
     * @param _user client who wishes to store data with the network
     * @param _dealDuration length of the storage deal in days
     * @param _hourlySegmentReward tokens to be paid to each node every hour while deal is ongoing
     * @param _totalFinalReward total tokens to be split and paid to all nodes at end of deal
     * @param _dailySchedule matrix of committed nodes for each hour of the day
     * @param _verifier external contract to validate poRep (proof of replication) and poSts (proof of spacetime)
     * @param poRep initial proof of replication to be validated
     */
    constructor (
        address _user, 
        uint _dealDuration, 
        uint _hourlySegmentReward, 
        uint _totalFinalReward, 
        address[][24] memory _dailySchedule,
        address _verifier,
        string memory poRep
    ) payable {
        owner = msg.sender;
        user = _user;
        dailySchedule = _dailySchedule;

        hourlySegmentReward = _hourlySegmentReward;
        totalFinalReward = _totalFinalReward;
        dealDuration = _dealDuration;
        dealStatus = Status.PENDING;

        setParticipants();
        proofHistory = new ProofHistory(poRep, dailySchedule);
    }

    function setParticipants() private {
        uint numMicroSectors = getNumMicroSectors();
        for (uint i = 0; i < dailySchedule.length; i++) {
            require(numMicroSectors == dailySchedule[i].length, "number of micro-sectors needs to be the same per hour");
            for (uint j = 0; j < dailySchedule[i].length; j++) {
                address node = dailySchedule[i][j];
                WorkLog storage log = participants[node];
                log.isParticipant = true;
                log.commitments += dealDuration;
            }
        }
    }

    function getNumMicroSectors() view private returns (uint) {
        uint numMicroSectors = dailySchedule[0].length;
        require(numMicroSectors > 0, "need at least one segment per hour");
        return numMicroSectors;
    }

    function startDeal() external payable {
        require(msg.sender == user, "unauthorized caller");
        require(dealStatus == Status.PENDING, "storage deal isn't pending");

        uint totalDailyReward = 24 * hourlySegmentReward * getNumMicroSectors();
        uint totalReward = (dealDuration * totalDailyReward) + totalFinalReward;
        // TODO we may want to take gas into account too.
        require(msg.value >= totalReward, "insufficient tokens to fund deal");
        console.log(msg.value, totalReward);
        startTime = block.timestamp;
        dealStatus = Status.IN_PROGRESS;
    }

    function submitPoSts(string[] memory proofs) external {
        validateOngoingDeal();
        validateNodeCommitmentToHour(msg.sender);
        proofHistory.recordPoStSubmission(msg.sender, proofs);
    }

    function validateOngoingDeal() view private {
        require(block.timestamp - startTime <= dealDuration * 1 days, "storage deal's end time has passed");
        require(dealStatus == Status.IN_PROGRESS, "storage deal isn't in progress");
    }

    function validateNodeCommitmentToHour(address node) view private {
        require(participants[node].isParticipant, "node isn't a deal participant");
        uint currHour = (block.timestamp / 1000 / 60 seconds / 60 minutes) % 24;
        for (uint j = 0; j < dailySchedule[currHour].length; j++) {
            if (node == dailySchedule[currHour][j]) {
                return;
            }
        }
        require(false, "node isn't committed to the current hour");
    }

    function rewardPoSts(address node, uint currDay, uint currHour, bool[] acceptedMicroSectors, bool[] rejectedMicroSectors) external {
        require(msg.sender == proofVerifier, "unauthorized caller");

        uint fulfillments = acceptedMicroSectors.length;
        recordFulfillments(msg.sender, fulfillments);
        sendHourlyReward(msg.sender, fulfillments);
        
        proofHistory.acceptProofs(node, currDay, currHour, acceptedMicroSectors);
        proofHistory.rejectProofs(node, currDay, currHour, rejectedMicroSectors);
    }

    function recordFulfillments(address node, uint fulfillments) private {
        participants[node].fulfillments += fulfillments;
    }

    // TODO instead of paying per hour, we can consider paying per day to save on gas?
    function sendHourlyReward(address node, uint fulfillments) private {
        payable(node).transfer(fulfillments * hourlySegmentReward);
    }

    function replaceNode(address oldNode, address newNode) public {
        require(msg.sender == owner, "unauthorized caller");
        validateOngoingDeal();
        for (uint i = 0; i < dailySchedule.length; i++) {
            for (uint j = 0; j < dailySchedule[i].length; j++) {
                if (dailySchedule[i][j] == oldNode) {
                    dailySchedule[i][j] = newNode;
                }
            }
        }
    }

    function endDeal() external {
        // We don't have an assertion that the storage deal's end time has passed
        // because it may be necessary to end the deal early in some cases.
        require(msg.sender == owner, "unauthorized caller");
        require(dealStatus == Status.IN_PROGRESS, "storage deal isn't in progress");
        
        uint totalCommitments = dealDuration * 24 * getNumMicroSectors();
        for (uint i = 0; i < dailySchedule.length; i++) {
            for (uint j = 0; j < dailySchedule[i].length; j++) {
                address node = dailySchedule[i][j];
                sendFinalReward(node, totalCommitments);
            }
        }

        // If there are remaining funds, that means either: 
        //  1) the user overpaid up front 
        //  2) or some nodes weren't fully compensated because they didn't fulfill the storage they committed to.
        // We should send these tokens back to the user.
        payable(user).transfer(address(this).balance);
        dealStatus = Status.COMPLETE;

        // TODO @ygao record the fulfillments and commitments in the node registry.
    }

    // The final reward for each node is based on the fraction of its fulfillments over the total commitments by all nodes.
    function sendFinalReward(address node, uint totalCommitments) private {
        WorkLog storage log = participants[node];
        if (!log.isParticipant) {
            return;
        }
        
        require(log.fulfillments <= log.commitments, "individual fulfillments must be fewer than or equal to individual committments");
        require(log.fulfillments < totalCommitments, "individual fulfillments must be fewer than total commitments");
        payable(node).transfer(totalFinalReward * log.fulfillments / totalCommitments);
        log.isParticipant = false;
    }

    function getCurrHour() pure private returns (uint) {
        return (block.timestamp / 1000 / 60 seconds / 60 minutes) % 24;
    }

    function getCurrDay() pure private returns (uint) {
        return block.timestamp / 1000 / 60 seconds / 60 minutes / 24 hours;
    }
}