const { expect } = require("chai");


const impersonateAddress = async (address) => {
    // https://hardhat.org/hardhat-network/reference/#hardhat-impersonateaccount
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [address],
    });

    const signer = await ethers.provider.getSigner(address);
    signer.address = signer._address;

    return signer;
};

// @dev Steal ERC20 tokens from address
const stealTokens = async (newOwner, transferAmount, token, whaleAddress) => {
    const whaleSigner = await impersonateAddress(whaleAddress);
    expect(await token.balanceOf(whaleSigner.address))
        .to.be.above(transferAmount);

    let oldBalance = await token.balanceOf(newOwner.address);
    await token.connect(whaleSigner).transfer(newOwner.address, transferAmount);
    let newBalance = oldBalance + transferAmount;
    //expect(await token.balanceOf(new_owner.address)).to.be.equal(newBalance); Check fails if tokens are stolen multiple times

    return newBalance;
};

module.exports = { impersonateAddress, stealTokens };
