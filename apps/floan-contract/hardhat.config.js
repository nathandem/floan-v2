require("@nomiclabs/hardhat-waffle");


// load private data to use in deployment
const ALCHEMY_MAINNET_API_KEY = process.env.ALCHEMY_MAINNET_API_KEY;
const ALCHEMY_KOVAN_API_KEY = process.env.ALCHEMY_KOVAN_API_KEY;
const METAMASK_MNEMONICS = process.env.METAMASK_MNEMONICS;
const METAMASK_ACCOUNT_1_PRIVATE_KEY = process.env.METAMASK_ACCOUNT_1_PRIVATE_KEY;

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
        kovan: {
            url: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KOVAN_API_KEY}`,
            // accounts: { mnemonic: METAMASK_MNEMONICS },
            accounts: [`0x${METAMASK_ACCOUNT_1_PRIVATE_KEY}`],
        },
        // ropsten: {
        //     url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}/`,
        //     accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
        // },
    },
};
