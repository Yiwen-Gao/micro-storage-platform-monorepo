// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract ProofVerifier {
    // TODO call Filecoin's storage miner actor
    function verifyPoRep(string memory proof) pure external returns (bool) {
        return true;
    }

    // TODO call Filecoin's storage miner actor
    function verifyPoSt(string memory proof) pure external returns (bool) {
        return true;
    }
}