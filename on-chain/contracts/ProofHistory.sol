// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract ProofHistory {
    enum Status { UNVERIFIED, ACCEPTED, REJECTED }
    struct ProofLog {
        address node;
        uint sector;
        string commR;
        uint proofNum;
        string proofBytes;
        Status status;
    }

    address owner;
    string public poRep;
    address[][24] public dailySchedule;
    mapping(string => ProofLog) public history;

    event poStSubmission(address node, uint day, uint hour);

    constructor(string memory _poRep, address[][24] memory _dailySchedule) {
        owner = msg.sender;
        poRep = _poRep;
        dailySchedule = _dailySchedule;
    }

    function recordPoStSubmission(address node, uint day, uint hour, uint[] memory sectors, string[] memory commRs, uint[] memory proofNums, string[] memory proofBytes) external {
        require(msg.sender == owner, "unauthorized caller");
        require(sectors.length == commRs.length, "sectors and commRs have to be the same length");
        require(sectors.length == proofNums.length, "sectors and proof numbers have to be the same length");
        require(sectors.length == proofBytes.length, "sectors and proof bytes have to be the same length");

        uint scheduledSectors = 0;
        for (uint j = 0; j < dailySchedule[hour].length; j++) {
            if (node == dailySchedule[hour][j]) {
                scheduledSectors++;
            }
        }
        require(sectors.length == scheduledSectors, "number of scheduled sectors for the hour don't match number of submitted proofs");
        
        for (uint i = 0; i < sectors.length; i++) {
            string memory key = getProofKey(node, day, hour, sectors[i]);
            history[key] = ProofLog(node, sectors[i], commRs[i], proofNums[i], proofBytes[i], Status.UNVERIFIED);
            console.log(node, day, hour, sectors[i]);
            console.log(key);
        }

        emit poStSubmission(node, day, hour);
    }

    function acceptProofs(address node, uint day, uint hour, uint[] memory sectors) external {
        require(msg.sender == owner, "unauthorized caller");
        setProofStatus(node, day, hour, sectors, Status.ACCEPTED);
    }

    function rejectProofs(address node, uint day, uint hour, uint[] memory sectors) external {
        require(msg.sender == owner, "unauthorized caller");
        setProofStatus(node, day, hour, sectors, Status.REJECTED);
    }

    function setProofStatus(address node, uint day, uint hour, uint[] memory sectors, Status status) private {
        for (uint i = 0; i < sectors.length; i++) {
            string memory key = getProofKey(node, day, hour, sectors[i]);
            history[key].status = status;
        }
    }

    function getProofKey(address node, uint day, uint hour, uint sector) pure public returns (string memory) {
        return string.concat(
            Strings.toHexString(uint160(node), 20),
            "-",
            Strings.toString(day),
            "-",
            Strings.toString(hour),
            "-",
            Strings.toString(sector)
        );
    }
}