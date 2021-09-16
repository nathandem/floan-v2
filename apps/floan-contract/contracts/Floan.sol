//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Floan {
    // STATE
    uint256 public constant BLOCKS_PER_DAY = 6400;  // assuming block creation averages 13.5 sec

    enum State { Requested, Funded, Withdrawn, PayedBack, Closed }
    struct Credit {
        address borrower;
        address lender;
        // all amounts here assume a ERC20 token with a decimal of 1e18, like DAI
        uint256 amount;
        uint256 repayAmount;
        uint256 durationInDays;
        // backend stores all blocks, e.g. the block coming from LoanRequested is stored as `requestBlock`
        // or the block coming in LoanClosed is persisted as `closeBlock`
        uint256 lastActionBlock;
        State state;
    }
    mapping(uint => Credit) credits;
    IERC20 public token;
    uint256 lastLoanId;

    // EVENTS
    // note: event names are aligned with the state
    event LoanRequested(uint loanId, address borrower, uint amount, uint repayAmount, uint duration, uint lastActionBlock);
    event LoanFunded(uint loanId, address lender, uint lastActionBlock);
    event LoanWithdrawn(uint loanId, uint lastActionBLock);
    event LoanPaidBack(uint loanId, uint lastActionBLock);
    event LoanClosed(uint loanId, uint lastActionBLock);

    constructor(address _token) {
        token = IERC20(_token);
    }

    // WRITE FUNCTIONS
    function requestLoan(uint256 _amount, uint256 _repayAmount, uint256 _durationInDays) public {
        require(_repayAmount >= _amount, "The amount to repay can't be smaller than the amount you wish to borrow");
        require(_durationInDays >= 1, "The duration of the loan can't be shorter than one day");

        lastLoanId++;
        uint lastActionBlock = block.number;
        address borrower = msg.sender;

        credits[lastLoanId] = Credit({
            borrower: borrower,
            lender: address(0),
            amount: _amount,
            repayAmount: _repayAmount,
            durationInDays: _durationInDays,
            lastActionBlock: lastActionBlock,
            state: State.Requested
        });

        emit LoanRequested(lastLoanId, borrower, _amount, _repayAmount, _durationInDays, lastActionBlock);
    }

    /* 
     * Transfer credit amount from balance of lender to that of Floan.
     * Function assumes that the amount has been approved by the lender on the ERC20 contract.
     */
    function fundLoan(uint _loanId) public {
        Credit storage credit = credits[_loanId];

        require(_loanId <= lastLoanId, "This loan doesn't exist");
        require(credit.state == State.Requested, "This loan has already been funded");
        require(msg.sender != credit.borrower, "You can't fund a loan you initiated");

        bool success = token.transferFrom(msg.sender, address(this), credit.amount);
        require(success, "The transfer of funds failed, do you have enough funds?");

        credit.lender = msg.sender;
        credit.lastActionBlock = block.number;
        credit.state = State.Funded;

        emit LoanFunded(_loanId, credit.lender, credit.lastActionBlock);
    }

    /* 
     * Transfer funds from balance of Floan to that of the borrower.
     */
    function withdrawLoan(uint _loanId) public {
        Credit storage credit = credits[_loanId];

        require(_loanId <= lastLoanId, "This loan doesn't exist");
        require(credit.state == State.Funded, "The loan must not already have been withdrawn");
        require(msg.sender == credit.borrower, "You can't withdraw the funds of a loan you didn't initiate");

        bool success = token.transfer(credit.borrower, credit.amount);
        require(success, "The transfer of funds failed");

        credit.state = State.Withdrawn;
        credit.lastActionBlock = block.number;

        emit LoanWithdrawn(_loanId, credit.lastActionBlock);
    }

    /* 
     * Requester reimburses repayAmount. Transfer funds from borrower to Floan account.
     * Function assumes that the repayAmount has been approved by the borrower on the ERC20 contract.
     */
    function paybackLoan(uint _loanId) public {
        Credit storage credit = credits[_loanId];

        require(_loanId <= lastLoanId, "This loan doesn't exist");
        require(credit.state == State.Withdrawn, "The funds of the credit must be withdrawn currently");
        require(msg.sender == credit.borrower, "You can't reimburse a loan you didn't initiate");

        bool success = token.transferFrom(msg.sender, address(this), credit.repayAmount);
        require(success, "The transfer of repay amount failed, do you have enough funds?");

        credit.state = State.PayedBack;
        credit.lastActionBlock = block.number;

        emit LoanPaidBack(_loanId, credit.lastActionBlock);
    }

    /*
     * Lender gets back his money + interest (repayAmount). Transfer funds from Floan account.
     */
    function recoupLoan(uint _loanId) public {
        Credit storage credit = credits[_loanId];

        require(_loanId <= lastLoanId, "This loan doesn't exist");
        require(msg.sender == credit.lender, "You can't claim funds on a credit you didn't fund");
        require(credit.state == State.PayedBack, "The credit must be payed back but not recouped yet");

        bool success = token.transfer(credit.lender, credit.repayAmount);
        require(success, "The transfer of funds failed");

        credit.state = State.Closed;
        credit.lastActionBlock = block.number;

        emit LoanClosed(_loanId, credit.lastActionBlock);
    }

    // function slashLoan(uint _loanId) public {}

    // VIEWER FUNCTIONS

    function getCredit(uint _loanId) public view returns(Credit memory) {
        return credits[_loanId];
    }

    function getTokenAddress() public view returns(address) {
        return address(token);
    }
}
