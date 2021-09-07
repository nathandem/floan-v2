// LOGIC MODULE
const { ethers } = require("ethers");
const Redis = require('ioredis');

const floanAbi = require('../abis/Floan.json');

const redis = new Redis(6379, 'localhost');


// const NODE_URL = 'https://eth-kovan.alchemyapi.io/v2/AOlPNrf3GD8oC7c7500gdMInW7OvTkzU';
const NODE_URL = 'http://localhost:8545';
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);

// TO BE CHANGED
// const FLOAN_ADDRESS = '0xDE77830C7Dfc4b7239F29Bbd87672c3ce9E29463';
const FLOAN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

const floanContract = new ethers.Contract(FLOAN_ADDRESS, floanAbi, provider);


// test connexion to contract works
floanContract.getTokenAddress().then(res => console.log(res));



// TODO: try websocket
// floanContract.on('LogRequestLoan', async (loanId, requester, amount, repayAmount, duration, event) => {
//     console.log(`LogRequestLoan event`);

//     const loan = { loanId, requester, amount, repayAmount, duration };
//     const res = await redis.set(`loan:${loanId}`, JSON.stringify(loan));

//     console.log(res);
// });



// // CONTROLLERS MODULE
const fastify = require('fastify')({ logger: true });

// Declare a route
fastify.get('/', async (request, reply) => {
    // https://tech.oyorooms.com/finding-and-deleting-the-redis-keys-by-pattern-the-right-way-123629d7730
    const loanKeys = await redis.keys('loan:8*');  // `keys` blocks the main/only thread of redis til it's over
    const loanValues = await redis.mget(loanKeys);

    const parsedLoanValues = loanValues.map(loanValue => JSON.parse(loanValue));

    // alternatively hashmaps don't require to parse values
    // https://tylerstroud.com/2014/11/18/storing-and-querying-objects-in-redis/
    // console.log(await redis.hgetall('cars:1'));

    return { hello: 'world', parsedLoanValues };
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(5000);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();



// Start by quering existing events and bringing the gap if there's any between the DB and what's on the blockchain
// async function getPastLogRequestLoans () {
//     const eventFilter = floanContract.filters.LogRequestLoan();
//     const pastLogRequestLoans = await floanContract.queryFilter(eventFilter);
//     // console.log(pastLogRequestLoans);

//     parsedPastLogRequestLoans = pastLogRequestLoans.map(logRequestLoan => ({
//         loanId: logRequestLoan.args.loanId,
//         requester: logRequestLoan.args.requester,
//         amount: logRequestLoan.args.amount,
//         repayAmount: logRequestLoan.args.repayAmount,
//         duration: logRequestLoan.args.duration,
//     }));

//     console.log(parsedPastLogRequestLoans);
// }