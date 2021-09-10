require("@nomiclabs/hardhat-waffle");


// load private data to use in deployment
const ALCHEMY_KOVAN_API_KEY = process.env.ALCHEMY_KOVAN_API_KEY || 'dummy';
const DEPLOYMENT_PK = process.env.DEPLOYMENT_PK || '0000000000';

// https://hardhat.org/config/
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: "0.8.4",
    networks: {
        hardhat: {
            // forking: {
            //     url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_MAINNET_API_KEY}`,
            //     blockNumber: 12927218,
            //     enabled: true,
            // },
            // mining: {
            //     auto: false,
            //     interval: 5000,
            // },
            chainId: 1337,
            // gas: 1000000,
            // gasPrice: 1000,
        },
        // LEAVE THE OUTSIDE NETWORKS COMMENTED BECAUSE THE CONF IS NOT LAZYLY LOADED
        // AND CRASHES IF ENV VARS ARE NOT READY
        kovan: {
            url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KOVAN_API_KEY}`,
            // accounts: { mnemonic: METAMASK_MNEMONICS },
            accounts: [`0x${DEPLOYMENT_PK}`],
        },
        // ropsten: {
        //     url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}/`,
        //     accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
        // },
    },
};
