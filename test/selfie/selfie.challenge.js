const { ethers } = require('hardhat')
const { expect } = require('chai')
const { time } = require('@nomicfoundation/hardhat-network-helpers')

describe('[Challenge] Selfie', function () {
  let deployer, player
  let token, governance, pool

  const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n
  const TOKENS_IN_POOL = 1500000n * 10n ** 18n

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    ;[deployer, player] = await ethers.getSigners()

    // Deploy Damn Valuable Token Snapshot
    token = await (
      await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer)
    ).deploy(TOKEN_INITIAL_SUPPLY)

    // Deploy governance contract
    governance = await (
      await ethers.getContractFactory('SimpleGovernance', deployer)
    ).deploy(token.address)
    expect(await governance.getActionCounter()).to.eq(1)

    // Deploy the pool
    pool = await (
      await ethers.getContractFactory('SelfiePool', deployer)
    ).deploy(token.address, governance.address)
    expect(await pool.token()).to.eq(token.address)
    expect(await pool.governance()).to.eq(governance.address)

    // Fund the pool
    await token.transfer(pool.address, TOKENS_IN_POOL)
    await token.snapshot()
    expect(await token.balanceOf(pool.address)).to.be.equal(TOKENS_IN_POOL)
    expect(await pool.maxFlashLoan(token.address)).to.eq(TOKENS_IN_POOL)
    expect(await pool.flashFee(token.address, 0)).to.eq(0)
  })

  it('Execution', async function () {
    /** CODE YOUR SOLUTION HERE */

    attack = await (
      await ethers.getContractFactory('AttackSelfie', deployer)
    ).deploy(pool.address, token.address, governance.address)

    const tx = await attack.connect(player).start()
    await tx.wait()

    const events = await governance.queryFilter(
      governance.filters.ActionQueued(null, null)
    )

    expect(events.length).to.equal(1)

    /*// Perform some action that should emit the event
  const transaction = await contract.someFunction();

  // Wait for the transaction to be mined
  await transaction.wait();

  // Access the emitted events
  const events = await contract.queryFilter(contract.filters.EventName());

  // Check if the event was emitted
  expect(events.length).to.equal(1);*/

    /*  
    const result = await attack
      .connect(player)
      .start()
      .then((tx) => {
        console.log(tx)
        attack.on('ActionQueued', (actionID, sender) => {
          console.log(actionID, sender)
        })
      })
      .catch((error) => {
        console.error(error)
      })

    */
  })

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player.address)).to.be.equal(TOKENS_IN_POOL)
    expect(await token.balanceOf(pool.address)).to.be.equal(0)
  })
})
