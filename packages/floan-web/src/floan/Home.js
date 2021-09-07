import PropTypes from 'prop-types';
import React from 'react';

import Button from '@material-ui/core/Button';

import './Home.css';


export default function Home({
    signerAddress,
    goToCreateLoanView,
    goToListPendingLoansView,
    goToListFundedLoansView,
    goToBorrowerDrawnLoansView,
    goToLoansToRecoupView,
}) {
    return (
        <div className="Home__container">
            <div>
                <div><h3>You are logged-in as {signerAddress}</h3></div>

                <div className="Home__button"><Button variant="outlined" onClick={goToCreateLoanView}>Create loan request</Button></div>
                <div className="Home__button"><Button variant="outlined" onClick={goToListPendingLoansView}>View open loans</Button></div>
                <div className="Home__button"><Button variant="outlined" onClick={goToListFundedLoansView}>Withdraw funds from loans your created which got funded</Button></div>
                <div className="Home__button"><Button variant="outlined" onClick={goToBorrowerDrawnLoansView}>Pay back your loans</Button></div>
                <div className="Home__button"><Button variant="outlined" onClick={goToLoansToRecoupView}>Recoup the funds from the reimbursed loans</Button></div>
            </div>
        </div>
    );
}

Home.propTypes = {
    goToCreateLoanView: PropTypes.func.isRequired,
    goToListPendingLoansView: PropTypes.func.isRequired,
    goToListFundedLoansView: PropTypes.func.isRequired,
    goToBorrowerDrawnLoansView: PropTypes.func.isRequired,
    goToLoansToRecoupView: PropTypes.func.isRequired,
    signerAddress: PropTypes.string.isRequired,
};
