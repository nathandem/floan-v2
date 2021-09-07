const { expect } = require("chai");
const { deployMockContract } = require("ethereum-waffle");
const { ethers } = require("hardhat");

const ERC20 = require('../artifacts/contracts/Token.sol/Token.json');


describe("Floan", () => {
    let Floan;
    let floan;
    let mockERC20;
    let owner;
    let bob;
    let alice;
    let charles;

    before(async () => {
        [owner, bob, alice, charles] = await ethers.getSigners();
        Floan = await ethers.getContractFactory("Floan");
    });

    beforeEach(async () => {
        mockERC20 = await deployMockContract(owner, ERC20.abi);
        floan = await Floan.deploy(mockERC20.address);
        await floan.deployed();
    });

    describe("Correctly initialize the contract when being deployed", () => {
        it("ERC20 token should be correctly set when contract is live", async () => {
            expect(await floan.token()).to.equal(mockERC20.address);
        });
    });

    describe("Fund loan", () => {
        let amount;
        let repayAmount;
        let oneYear;

        beforeEach(async () => {
            amount = ethers.utils.parseEther('10000').toString();
            repayAmount = ethers.utils.parseEther('11000').toString();
            oneYear = 365 * 24 * 60 * 60;

            await floan.connect(bob).requestLoan(amount, repayAmount, oneYear);
        });

        it("Aborts when transfer fails", async () => {
            await mockERC20.mock.transfer.withArgs(bob.address, amount).returns(false);

            await expect(floan.connect(alice).fundLoan(1)).to.be.revertedWith("The transfer of funds failed, do you have enough funds?");
        });

        it("Aborts when loan doesn't exist", async () => {
            await expect(floan.connect(alice).fundLoan(100)).to.be.revertedWith("This loan doesn't exist");
        });

        it("Aborts when loan has already been funded", async () => {
            await mockERC20.mock.transfer.withArgs(bob.address, amount).returns(true);
            await floan.connect(charles).fundLoan(1);

            await expect(floan.connect(alice).fundLoan(1)).to.be.revertedWith("This loan has already been funded");
        });

        it("Succeeds when ERC20 transfer works, loan exists and has not yet been funded", async () => {
            await mockERC20.mock.transfer.withArgs(bob.address, amount).returns(true);

            // startDate value depends on block.timestamp
            // evm_setNextBlockTimestamp allows to set the time of the next block
            const nextBlockTimestamp = 2627657056;
            await hre.network.provider.request({
                method: "evm_setNextBlockTimestamp",
                params: [nextBlockTimestamp],
            });

            await expect(floan.connect(alice).fundLoan(1))
                .to.emit(floan, 'LogFundLoan')
                .withArgs(1, nextBlockTimestamp, oneYear);

            const credit = await floan.getCredit(1);

            expect(credit.lender).to.equal(alice.address);
            expect(credit.startDate).to.equal(nextBlockTimestamp);
            expect(credit.state).to.equal(1);
        });
    });
});
