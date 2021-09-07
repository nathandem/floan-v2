import PropTypes from 'prop-types';
import React from 'react';
import { ethers } from "ethers";

import floanAbi from '../abis/Floan.json';
import erc20Abi from '../abis/ERC20.json';

import CreateLoan from './CreateLoan';
import Home from './Home';
import LoanList from './LoanList';
import BorrowerLoanList from './BorrowerLoanList';

import { getLoans } from '../helpers/backendQueries';


const VIEWS = {
    HOME: 'home',
    CREATE_LOAN: 'create_loan',
    LIST_PENDING_LOANS: 'list_pending_loans',
    LIST_FUNDED_LOANS: 'list_funded_loans',
    BORROWER_DRAWN_LOANS_VIEW: 'borrower_drawn_loans_view',
    LIST_LOANS_TO_RECOUP_VIEW: 'list_loans_to_recoup_view',
};

const GAS_OPTIONS = {
    gasPrice: 10000000000,  // 10 gwei
    gasLimit: 100000,  // for reference, simple transfer 21k and ERC20 approve 26k
};

export default class FLoan extends React.PureComponent {

    state = {
        floanContract: null,  // ethers.js Contract entity for floan
        tokenContract: null,  // ethers.js Contract entity for dai
        activeView: VIEWS.HOME,
        loans: [],
    };

    componentDidMount = async () => {
        const floanContract = new ethers.Contract(process.env.REACT_APP_FLOAN_ADDRESS, floanAbi, this.props.signer);

        // Get DAI ERC20 address
        const tokenAddress = await floanContract.getTokenAddress();
        // const tokenAddress = '0x00EC3CCd71CF19e27392c5b21A9f5fa632B43768';  // on Kovan
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.props.signer);

        floanContract.on('LogRequestLoan', (loanId, borrower, amount, repaymentAmount, duration, event) => {
            console.log(`LogRequestLoan event`);
            console.log(event);
        });

        floanContract.on('LogFundLoan', (loanId, lender, startBlock, event) => {
            console.log(`LogFundLoan event`);
            console.log(event);
        });

        // const eventFilter = floanContract.filters.LogRequestLoan();
        // const requestLoanEvents = await floanContract.queryFilter(eventFilter, process.env.REACT_APP_FLOAN_KOVAN_GENESIS_BLOCK);
        // console.log(requestLoanEvents);

        this.setState({ tokenContract, floanContract });
    }

    componentWillUnmount() {
        // remove all listeners added on floanContract in `componentDidMount`
        this.state.floanContract.removeAllListeners();
    }

    // change view

    goToCreateLoanView = () => {
        this.setState({ activeView: VIEWS.CREATE_LOAN });
    }

    goToListPendingLoansView = async () => {
        const loans = await getLoans();
        console.log(loans);
        this.setState({ activeView: VIEWS.LIST_PENDING_LOANS, loans });
    }

    goToListFundedLoansView = async () => {
        const loans = await getLoans();
        console.log(loans);
        this.setState({ activeView: VIEWS.LIST_FUNDED_LOANS, loans });
    }

    goToBorrowerDrawnLoansView = async () => {
        const loans = await getLoans();
        console.log(loans);
        this.setState({ activeView: VIEWS.BORROWER_DRAWN_LOANS_VIEW, loans });
    }

    goToLoansToRecoupView = async () => {
        const loans = await getLoans();
        console.log(loans);
        this.setState({ activeView: VIEWS.LIST_LOANS_TO_RECOUP_VIEW, loans });
    }

    goToHomeView = () => {
        this.setState({ activeView: VIEWS.HOME });
    }

    // interactions with the smart contracts

    createLoanOffer = async (amountInFiat, repayAmountInFiat, durationInDays) => {
        // convert fiat amounts (denominated like eth) to amounts with a precision of 1e18 at the decimal (like wei)
        const amountInWeiLikeDenomination = ethers.utils.parseEther(amountInFiat);
        const repayAmountInWeiLikeDenomination = ethers.utils.parseEther(repayAmountInFiat);

        // const transaction = await this.state.floanContract.requestLoan(amount, repayAmount, durationInDays, GAS_OPTIONS);
        const txReceipt = await this.state.floanContract.requestLoan(
            amountInWeiLikeDenomination,
            repayAmountInWeiLikeDenomination,
            durationInDays
        );
        console.log(txReceipt);

        // IF WE WANT TO WAIT THAT THE TRANSACTION GETS IN A BLOCK (CAN BE LONG)
        // const receipt = await tx.wait();
        // console.log(receipt);

        alert('Loan properly created!');
        this.goToHomeView();
    }

    fundLoan = async (loanId, amountInFiat) => {
        // like eth (with wei), dai amounts must be dealt with 1e18 decimal precision
        const amountInWeiLikeDenomination = ethers.utils.parseEther(amountInFiat);

        // note: ethereum nonce mechanism and sequential execution of transactions by miners
        // guarantee that `approve` transaction executed before `fundLoan`
        let txReceipt = await this.state.tokenContract.approve(this.state.floanContract.address, amountInWeiLikeDenomination);
        console.log(txReceipt)
        // tx = await this.state.floanContract.fundLoan(loanId, GAS_OPTIONS);
        txReceipt = await this.state.floanContract.fundLoan(loanId);
        console.log(txReceipt);

        alert(`You successfully funded loan: ${loanId}`);
        this.goToHomeView();
    }

    withdrawLoan = async (loanId) => {
        // simple call to backend to transfer the funds from smart contract to borrower's address
        let txReceipt = await this.state.floanContract.withdrawLoan(loanId);
        console.log(txReceipt);

        alert(`You successfully withdrawn the funds from loan: ${loanId}`);
        this.goToHomeView();
    }

    paybackLoan = async (loanId, repayAmountInFiat) => {
        // like eth (with wei), dai amounts must be dealt with 1e18 decimal precision
        const repayAmountInWeiLikeDenomination = ethers.utils.parseEther(repayAmountInFiat);

        let txReceipt = await this.state.tokenContract.approve(this.state.floanContract.address, repayAmountInWeiLikeDenomination);
        console.log(txReceipt);

        txReceipt = await this.state.floanContract.paybackLoan(loanId);
        console.log(txReceipt);

        alert(`You successfully payed back loan: ${loanId}`);
        this.goToHomeView();
    }

    recoupLoan = async (loanId) => {
        // simple call to backend to transfer the funds from smart contract to lender's address
        let txReceipt = await this.state.floanContract.recoupLoan(loanId);
        console.log(txReceipt);

        alert(`You successfully recouped the funds from loan: ${loanId}`);
        this.goToHomeView();
    }

    render() {
        let activeView;
        if (this.state.activeView === VIEWS.HOME) {
            activeView = <Home
                goToCreateLoanView={this.goToCreateLoanView}
                goToListPendingLoansView={this.goToListPendingLoansView}
                goToListFundedLoansView={this.goToListFundedLoansView}
                goToBorrowerDrawnLoansView={this.goToBorrowerDrawnLoansView}
                goToLoansToRecoupView={this.goToLoansToRecoupView}
                signerAddress={this.props.signerAddress}
            />;
        } else if (this.state.activeView === VIEWS.CREATE_LOAN) {
            activeView = <CreateLoan
                goToHomeView={this.goToHomeView}
                createLoanOffer={this.createLoanOffer}
            />;
        } else if (this.state.activeView === VIEWS.LIST_PENDING_LOANS) {
            activeView = <LoanList
                goToHomeView={this.goToHomeView}
                loans={this.state.loans.filter(loan => (
                    loan.borrower.toLowerCase() !== this.props.signerAddress.toLowerCase()
                    && loan.status === 'PENDING')
                )}
                action={this.fundLoan}
            />;
        } else if (this.state.activeView === VIEWS.LIST_FUNDED_LOANS) {
            activeView = <LoanList
                goToHomeView={this.goToHomeView}
                loans={this.state.loans.filter(loan => (
                    loan.borrower.toLowerCase() === this.props.signerAddress.toLowerCase()
                    && loan.status === 'FUNDED'
                ))}
                action={this.withdrawLoan}
            />;
        } else if (this.state.activeView === VIEWS.BORROWER_DRAWN_LOANS_VIEW) {
            activeView = <BorrowerLoanList
                title={'Reimburse loans'}
                goToHomeView={this.goToHomeView}
                borrowerLoans={this.state.loans.filter(loan => (
                    loan.borrower.toLowerCase() === this.props.signerAddress.toLowerCase()
                    && loan.status === 'WITHDRAWN'
                ))}
                action={this.paybackLoan}
            />;
        } else if (this.state.activeView === VIEWS.LIST_LOANS_TO_RECOUP_VIEW) {
            activeView = <LoanList
                goToHomeView={this.goToHomeView}
                loans={this.state.loans.filter(loan => (
                    loan.lender
                    && loan.lender.toLowerCase() === this.props.signerAddress.toLowerCase()
                    && loan.status === 'PAYED_BACK'
                ))}
                action={this.recoupLoan}
            />;
        }

        return (
            <div>
                {activeView}
            </div>
        );
    }
}

FLoan.propTypes = {
    provider: PropTypes.object.isRequired,
    signer: PropTypes.object.isRequired,
    signerAddress: PropTypes.string.isRequired,
};
