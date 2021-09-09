const { ethers } = require("ethers");
const ERC20Abi = require('../abis/ERC20.json');


const ADDRESS_ONE = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const ADDRESS_TWO = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

const NODE_URL = 'http://localhost:8545';
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);

// must be an account managed by the node (don't really know what that means though)
const addrOneSigner = provider.getSigner(ADDRESS_ONE);

addrOneSigner.getAddress().then(res => console.log(res))

// call `Token.transfer` to given 40 tokens to address 2
const TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20Abi, addrOneSigner);
tokenContract.transfer(ADDRESS_TWO, ethers.utils.parseEther('40'));
