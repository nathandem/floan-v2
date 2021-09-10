//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Floan {
    // EVENTS
    event LogRequestLoan(uint loanId, address borrower, uint amount, uint repayAmount, uint duration);
    event LogFundLoan(uint loanId, address lender, uint startBlock);
    event LogLoanWithdrawn(uint loanId);
    event LogPaybackLoan(uint loanId);
    event LogClosedLoan(uint loanId);

    // STATE
    uint256 public constant BLOCKS_PER_DAY = 6400;  // assuming block creation averages 13.5 sec

    enum State { Pending, Funded, Withdrawn, PayedBack, Closed, Slashed }
    struct Credit {
        address borrower;
        address lender;
        // all amounts here assume a ERC20 token with a decimal of 1e18, like DAI
        uint256 amount;
        uint256 repayAmount;
        uint256 durationInDays;
        uint256 startBlock;
        State state;
    }
    mapping(uint => Credit) credits;
    IERC20 public token;
    uint256 lastLoanId;

    constructor(address _token) {
        token = IERC20(_token);
    }

    // WRITE FUNCTIONS
    function requestLoan(uint256 _amount, uint256 _repayAmount, uint256 _durationInDays) public {
        require(_repayAmount >= _amount, "The amount to repay can't be smaller than the amount you wish to borrow");
        require(_durationInDays >= 1, "The duration of the loan can't be shorter than one day");

        lastLoanId++;
        credits[lastLoanId] = Credit({
            borrower: msg.sender,
            lender: address(0),
            amount: _amount,
            repayAmount: _repayAmount,
            durationInDays: _durationInDays,
            startBlock: 0,
            state: State.Pending
        });

        emit LogRequestLoan(lastLoanId, msg.sender, _amount, _repayAmount, _durationInDays);
    }

    /* 
     * Transfer credit amount from balance of lender to that of Floan.
     * Function assumes that the amount has been approved by the lender on the ERC20 contract.
     */
    function fundLoan(uint _loanId) public {
        Credit storage credit = credits[_loanId];

        require(_loanId <= lastLoanId, "This loan doesn't exist");
        require(credit.state == State.Pending, "This loan has already been funded");
        require(msg.sender != credit.borrower, "You can't fund a loan you initiated");

        bool success = token.transferFrom(msg.sender, address(this), credit.amount);
        require(success, "The transfer of funds failed, do you have enough funds?");

        credit.lender = msg.sender;
        credit.startBlock = block.number;
        credit.state = State.Funded;

        emit LogFundLoan(_loanId, credit.lender, credit.startBlock);
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

        emit LogLoanWithdrawn(_loanId);
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

        emit LogPaybackLoan(_loanId);
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

        emit LogClosedLoan(_loanId);
    }

    // slashDebtor(loanId)

    // VIEWER FUNCTIONS

    function getCredit(uint _loanId) public view returns(Credit memory) {
        return credits[_loanId];
    }

    function getTokenAddress() public view returns(address) {
        return address(token);
    }
}
