/*
 * Create a copy of Floan hardhat generated ABI in `/abis`.
 * `/abis` is the directory in which floan-web and floan-backend read Floan ABI.
 * 
 * IMPORTANT:
 * This script should be called from the root of the project, else the paths won't
 * resolve properly. Best way to run this script is: `yarn run contract:compile`
 * from the root of the project.
 */

const fs = require('fs');


// constants

const HARDHAT_ARTIFACT_DEFAULT_PATH_FOR_FLOAN_CONTRACT = './packages/floan-contract/artifacts/contracts/Floan.sol/Floan.json';
const FLOAN_BACKEND_ABIS_PATH = './packages/floan-backend/abis/Floan.json';
// note: by default create-react-app doesn't allow import outside of `src`, let's stick with that
const FLOAN_WEB_ABIS_PATH = './packages/floan-web/src/abis/Floan.json';


// logic

function getStringifiedFloanHardhatArtifact(floanHardhatArtifactPath) {
    try {
        const floanContractBuffer = fs.readFileSync(floanHardhatArtifactPath);
        return floanContractBuffer.toString();
    } catch (e) {
        console.error('Issue getting the compile contract from hardhat default artifact location', error);
    }
}

function writeFloanAbiToDestination(path, prettifiedFloanAbiString) {
    try {
        fs.writeFileSync(path, prettifiedFloanAbiString);
    } catch (error) {
        console.error(`Issue writting abi to ${path}`, error);
    }
}

function main() {
    const stringifiedFloanHardhatArtifact = getStringifiedFloanHardhatArtifact(HARDHAT_ARTIFACT_DEFAULT_PATH_FOR_FLOAN_CONTRACT);
    const parsedFloanHardhatArtifact = JSON.parse(stringifiedFloanHardhatArtifact);
    const prettifiedFloanAbiString = JSON.stringify(parsedFloanHardhatArtifact.abi, null, 4);

    writeFloanAbiToDestination(FLOAN_BACKEND_ABIS_PATH, prettifiedFloanAbiString);
    writeFloanAbiToDestination(FLOAN_WEB_ABIS_PATH, prettifiedFloanAbiString);
}

main()
