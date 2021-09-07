// LOGIC MODULE
const { ethers } = require("ethers");
const floanAbi = require('../abis/Floan.json');


const NODE_URL = 'http://localhost:8545';
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
const provider = new ethers.providers.PocketProvider()


const FLOAN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const floanContract = new ethers.Contract(FLOAN_ADDRESS, floanAbi, provider);


floanContract.getTokenAddress().then(res => console.log(res));
