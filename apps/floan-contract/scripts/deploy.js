const hre = require("hardhat");


// deploy script for local dev env
async function main() {
    const [owner] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    const Token = await hre.ethers.getContractFactory("Token");
    const token = await Token.deploy("NDAI", "Nat DAI token");

    await token.deployed();
    console.log("Token deployed to:", token.address);

    const Floan = await hre.ethers.getContractFactory("Floan");
    const floan = await Floan.deploy(token.address);

    await floan.deployed();
    console.log("Floan deployed to:", floan.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
