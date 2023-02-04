// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract ProofHistory {
    enum Status { UNVERIFIED, ACCEPTED, REJECTED }
    struct ProofLog {
        address node;
        string proof;
        Status status;
    }

    address owner;
    string public poRep;
    address[][24] dailySchedule;
    mapping(string => ProofLog) history;

    constructor(string memory _poRep, address[][24] memory _dailySchedule) {
        owner = msg.sender;
        poRep = _poRep;
        dailySchedule = _dailySchedule;
    }

    function recordPoStSubmission(address node, uint currDay, uint currHour, string[] memory proofs) external {
        require(msg.sender == owner, "unauthorized caller");
        uint[] memory microSectors = new uint[](proofs.length);
        uint idx = 0;
        for (uint j = 0; j < dailySchedule[currHour].length; j++) {
            if (node == dailySchedule[currHour][j]) {
                microSectors[idx++] = j;
            }
        }
        
        for (uint i = 0; i < microSectors.length; i++) {
            string memory key = getProofKey(node, currDay, currHour, microSectors[i]);
            history[key] = ProofLog(node, proofs[i], Status.UNVERIFIED);
        }
    }

    function acceptProofs(address node, uint day, uint hour, uint[] memory microSectors) external {
        require(msg.sender == owner, "unauthorized caller");
        setProofStatus(node, day, hour, microSectors, Status.ACCEPTED);
    }

    function rejectProofs(address node, uint day, uint hour, uint[] memory microSectors) external {
        require(msg.sender == owner, "unauthorized caller");
        setProofStatus(node, day, hour, microSectors, Status.REJECTED);
    }

    function setProofStatus(address node, uint day, uint hour, uint[] memory microSectors, Status status) private {
        for (uint i = 0; i < microSectors.length; i++) {
            string memory key = getProofKey(node, day, hour, microSectors[i]);
            history[key].status = status;
        }
    }

    function getProofKey(address node, uint currDay, uint currHour, uint microSector) pure private returns (string memory) {
        return Strings.toHexString(uint160(node), 20) + "-" + Strings.toString(currDay) + "-" + Strings.toString(currHour) + "-" + Strings.toString(microSector);
    }
}