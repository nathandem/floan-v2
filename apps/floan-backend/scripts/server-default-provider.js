// LOGIC MODULE
const { ethers } = require("ethers");
const Redis = require('ioredis');

const floanAbi = require('../abis/Floan.json');


// const redis = new Redis(6379, 'localhost');


// NOTE: this design could be improved by using redis's hashmaps.
// Hashmap allows for queries based on properties.
// Here we could query based on date.
// https://tylerstroud.com/2014/11/18/storing-and-querying-objects-in-redis/

// side-effect on purpose
const FLOAN_KOVAN_ADDRESS = '0xDE77830C7Dfc4b7239F29Bbd87672c3ce9E29463';
const KOVAN_GENESIS_BLOCK = 26355680;
const NETWORK = 'kovan';

const provider = ethers.getDefaultProvider(NETWORK, {
    // etherscan: YOUR_ETHERSCAN_API_KEY,
    // infura: YOUR_INFURA_PROJECT_ID,
    // Or if using a project secret:
    // infura: {
    //   projectId: YOUR_INFURA_PROJECT_ID,
    //   projectSecret: YOUR_INFURA_PROJECT_SECRET,
    // },
    // alchemy: 'https://eth-kovan.alchemyapi.io/v2/AOlPNrf3GD8oC7c7500gdMInW7OvTkzU',
    // pocket: YOUR_POCKET_APPLICATION_KEY
    // Or if using an application secret key:
    pocket: {
      applicationId: '0f35872ac9a97e32799b7d5df43f2671b5d40da2',
      applicationSecretKey: '4a3b9ba634d45f3511231c2e03d1165f',
    }
});

// console.log(provider);

const floanContract = new ethers.Contract(FLOAN_KOVAN_ADDRESS, floanAbi, provider);

// console.log(floanContract);

// TODO: Start by quering existing events and bringing the gap if there's any between the DB and what's on the blockchain
// const eventFilter = floanContract.filters.LogRequestLoan();
// const requestLoanEvents = await floanContract.queryFilter(eventFilter, process.env.REACT_APP_FLOAN_KOVAN_GENESIS_BLOCK);
// console.log(requestLoanEvents);

// floanContract.on('LogDrawLoan', async (requester, loanId, event) => {
//     console.log(`LogDrawLoan event`);
//     console.log(loanId);

//     const credit = await floanContract.getCredit(loanId);
//     console.log(credit);

//     // store stringified credit object with a `endDate` key (startTime + duration)
// });

floanContract.getTokenAddress().then(res => console.log(res));

floanContract.on('LogRequestLoan', (loanId, requester, amount, repaymentAmount, duration, event) => {
    console.log(`LogRequestLoan event`);
    console.log(event);
});






// // CONTROLLERS MODULE
// const fastify = require('fastify')({ logger: true });

// // Declare a route
// fastify.get('/', async (request, reply) => {
//     const res = await redis.get('key1');
//     return { hello: 'world', res };
// })

// // Run the server!
// const start = async () => {
//     try {
//         await fastify.listen(3000);
//     } catch (err) {
//         fastify.log.error(err);
//         process.exit(1);
//     }
// }

// start();