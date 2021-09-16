const { expect } = require("chai");
const { deployMockContract } = require("ethereum-waffle");
const { ethers } = require("hardhat");

const ERC20 = require('../artifacts/contracts/Token.sol/Token.json');


const FLOAN_STATUSES = {
    Requested: 0,
    Funded: 1,
    Withdrawn: 2,
    PayedBack: 3,
    Closed: 4,
    Slashed: 5,
};

describe("Floan", () => {
    let FloanContract;
    let floan;
    let ERC20Mock;
    let owner;
    let bob;
    let alice;
    let charles;

    before(async () => {
        [owner, bob, alice, charles] = await ethers.getSigners();
        FloanContract = await ethers.getContractFactory("Floan");
    });

    beforeEach(async () => {
        ERC20Mock = await deployMockContract(owner, ERC20.abi);
        floan = await FloanContract.deploy(ERC20Mock.address);
        await floan.deployed();
    });

    describe("Correctly initialize the contract when being deployed", () => {
        it("ERC20 token should be correctly set when contract is live", async () => {
            expect(await floan.token()).to.equal(ERC20Mock.address);
        });
    });

    describe("Request loan", () => {
        // reminder: amounts are dealt with in wei-like denomination (18 decimal)
        const AMOUNT = ethers.utils.parseEther('1000').toString();
        const REPAY_AMOUNT = ethers.utils.parseEther('1100').toString();
        const ONE_YEAR_IN_DAYS = 365;

        it("Fails when repay amount smaller than initial amount", async () => {
            await expect(floan.requestLoan(AMOUNT, '1', ONE_YEAR_IN_DAYS)).to.be.revertedWith("The amount to repay can't be smaller than the amount you wish to borrow");
        });

        it("Fails when duration under 1 day", async () => {
            await expect(floan.requestLoan(AMOUNT, REPAY_AMOUNT, 0)).to.be.revertedWith("The duration of the loan can't be shorter than one day");
        });

        it("Last loan id increases between credits", async () => {
            const prevBlockNb = await ethers.provider.getBlockNumber();

            await expect(floan.requestLoan(AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS)).to.emit(floan, "LoanRequested").withArgs(1, owner.address, AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS, prevBlockNb + 1);
            // Hardhat auto-mine is assumed, 1 transaction per block
            // https://hardhat.org/hardhat-network/explanation/mining-modes.html#mining-modes
            await expect(floan.requestLoan(AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS)).to.emit(floan, "LoanRequested").withArgs(2, owner.address, AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS, prevBlockNb + 2);
        });

        it("Credit sucessfully created with Requested status when all conditions are met", async () => {
            const prevBlockNb = await ethers.provider.getBlockNumber();

            await expect(floan.requestLoan(AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS)).to.emit(floan, "LoanRequested").withArgs(1, owner.address, AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS, prevBlockNb +1);

            const credit = await floan.getCredit(1);
            expect(credit.borrower).to.eq(owner.address);
            expect(credit.amount).to.eq(AMOUNT);
            expect(credit.repayAmount).to.eq(REPAY_AMOUNT);
            expect(credit.durationInDays).to.eq(ONE_YEAR_IN_DAYS);
            expect(credit.lastActionBlock).to.eq(prevBlockNb + 1);
            expect(credit.state).to.eq(FLOAN_STATUSES.Requested);
        });
    });

    describe("Fund loan", () => {
        // reminder: amounts are dealt with in wei-like denomination (18 decimal)
        const AMOUNT = ethers.utils.parseEther('1000').toString();
        const REPAY_AMOUNT = ethers.utils.parseEther('1100').toString();
        const ONE_YEAR_IN_DAYS = 365;

        beforeEach(async () => {
            await floan.connect(bob).requestLoan(AMOUNT, REPAY_AMOUNT, ONE_YEAR_IN_DAYS);
            await ERC20Mock.mock.transferFrom.withArgs(alice.address, floan.address, AMOUNT).returns(true);
        });

        it("Aborts when no allowance from lender to Floan", async () => {
            await ERC20Mock.mock.transferFrom.withArgs(alice.address, floan.address, AMOUNT).returns(false);

            await expect(floan.connect(alice).fundLoan(1)).to.be.revertedWith("The transfer of funds failed, do you have enough funds?");
        });

        it("Aborts when loan doesn't exist", async () => {
            await expect(floan.connect(alice).fundLoan(100)).to.be.revertedWith("This loan doesn't exist");
        });

        it("Aborts when loan has already been funded", async () => {
            await ERC20Mock.mock.transferFrom.withArgs(charles.address, floan.address, AMOUNT).returns(true);
            await floan.connect(charles).fundLoan(1);

            await expect(floan.connect(alice).fundLoan(1)).to.be.revertedWith("This loan has already been funded");
        });

        it("Aborts when lender is also borrower", async () => {
            await ERC20Mock.mock.transferFrom.withArgs(bob.address, floan.address, AMOUNT).returns(true);

            await expect(floan.connect(bob).fundLoan(1)).to.be.revertedWith("You can't fund a loan you initiated");
        });

        it("Succeeds when ERC20 transfer from lender to Floan works and other required conditions are met", async () => {
            // startDate value depends on block.timestamp
            // evm_setNextBlockTimestamp allows to set the time of the next block
            // const nextBlockTimestamp = 2627657056;
            // await hre.network.provider.request({
            //     method: "evm_setNextBlockTimestamp",
            //     params: [nextBlockTimestamp],
            // });
            const prevBlockNb = await ethers.provider.getBlockNumber();

            await expect(floan.connect(alice).fundLoan(1))
                .to.emit(floan, 'LoanFunded')
                .withArgs(1, alice.address, prevBlockNb + 1);

            const credit = await floan.getCredit(1);

            expect(credit.lender).to.equal(alice.address);
            expect(credit.state).to.equal(FLOAN_STATUSES.Funded);
            expect(credit.lastActionBlock).to.equal(prevBlockNb + 1);
        });
    });
});
