const { ethers } = require("ethers");
const floanAbi = require('../abis/Floan.json');
const ERC20Abi = require('../abis/ERC20.json');


const NODE_URL = 'http://localhost:8545';
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);

const FLOAN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const floanContract = new ethers.Contract(FLOAN_ADDRESS, floanAbi, provider);

const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20Abi, provider);


const ADDRESS_ONE = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const ADDRESS_TWO = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

floanContract.getCredit(1).then(res => console.log(`Amount to get from the credit 1: ${res.amount.toString()}`));
tokenContract.allowance(ADDRESS_ONE, FLOAN_ADDRESS).then(res => console.log(`Allowance from addr1 to floan address: ${res.toString()}`));
tokenContract.allowance(ADDRESS_TWO, FLOAN_ADDRESS).then(res => console.log(`Allowance from addr2 to floan address: ${res.toString()}`));
tokenContract.balanceOf(ADDRESS_ONE).then(res => console.log(`BalanceOf 1st account: ${res.toString()}`));
tokenContract.balanceOf(ADDRESS_TWO).then(res => console.log(`BalanceOf 2nd account: ${res.toString()}`));
tokenContract.balanceOf(FLOAN_ADDRESS).then(res => console.log(`BalanceOf FLOAN account: ${res.toString()}`));
