//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";


contract AttackSelfie {
    /**
     * 1. Make a flash loan for the tokens 
     * 2. Make a proposol to transfer the funds to me
     * 3. Advance time and execute the proposal
     * 4. Pass the challenge
     * 
     * Flash loans really are double edged swords. Really cool...
     */



}