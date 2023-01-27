// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// This contract represents one storage deal. A new instance should be deployed on chain for each deal that's brokered.
contract StorageDeal {
    address owner;
    address user;
    address[24][] dailySchedule;
    uint hourlyReward;
    uint totalFinalReward;
    mapping(address => bool) participatingNodes;

    constructor (address _user, uint dealDays, uint _hourlyReward, uint _totalFinalReward, address[24][] memory _dailySchedule) payable {
        uint totalHourlyReward = 24 * _hourlyReward * dealDays;
        require(msg.value >= totalHourlyReward + _totalFinalReward, "insufficient tokens to fund deal");

        owner = msg.sender;
        user = _user;
        hourlyReward = _hourlyReward;
        totalFinalReward = _totalFinalReward;
        dailySchedule = _dailySchedule;
        for (uint i = 0; i < _dailySchedule.length; i++) {
            for (uint j = 0; j < _dailySchedule[i].length; j++) {
                address node = _dailySchedule[i][j];
                participatingNodes[node] = true;
            }
        }
    }

    function checkIsDealParticipant(address node) view private {
        require(participatingNodes[node], "node isn't a deal participant");
    }

    function replaceNode(address oldNode, address newNode) public {
        require(msg.sender == owner, "unauthorized caller");
        for (uint i = 0; i < dailySchedule.length; i++) {
            for (uint j = 0; j < dailySchedule[i].length; j++) {
                if (dailySchedule[i][j] == oldNode) {
                    dailySchedule[i][j] = newNode;
                }
            }
        }
    }

    // TODO call Filecoin's storage miner actor
    function verifyPoRep(string memory proof) external returns (bool) {
        checkIsDealParticipant(msg.sender);
        return true;
    }

    // TODO call Filecoin's storage miner actor
    function verifyPoST(string memory proof) external returns (bool) {
        checkIsDealParticipant(msg.sender);
        bool isValid = true;
        if (isValid) {
            sendHourlyReward(msg.sender);
        }
        return isValid;
    }

    // TODO instead of paying per hour, we can consider paying per day to save on gas
    function sendHourlyReward(address node) private {
        checkIsDealParticipant(node);
        payable(node).transfer(hourlyReward);
    }

    function sendFinalReward(address node) public {
        checkIsDealParticipant(msg.sender);
        uint dailyHours = 0;
        // TODO move this computation off chain
        for (uint i = 0; i < dailySchedule.length; i++) {
            for (uint j = 0; j < dailySchedule[i].length; j++) {
                if (dailySchedule[i][j] == node) {
                    dailyHours++;
                }
            }
        }
        require(dailyHours <= 24, "daily hours must be less than or equal to 24");
        payable(node).transfer(dailyHours / 24 * totalFinalReward);
    }
}