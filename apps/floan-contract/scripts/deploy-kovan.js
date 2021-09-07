const hre = require("hardhat");


// NOT TRIED

// deploy script for local dev env
async function main() {
    const [owner] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", owner.address);

    // https://kovan.etherscan.io/token/0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa
    const DAI_KOVAN_ADDRESS = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';

    const Floan = await hre.ethers.getContractFactory("Floan");
    const floan = await Floan.deploy(DAI_KOVAN_ADDRESS);

    await floan.deployed();
    console.log("Floan deployed to:", floan.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
