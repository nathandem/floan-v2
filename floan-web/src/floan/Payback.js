import PropTypes from 'prop-types';
import React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './CreateLoan.css';


export default class Payback extends React.PureComponent {

    state = {
        loanId: '',
    };

    prepCreateLoanOffer = () => {
        
    }

    render() {
        return (
            <div className="CreateLoan__container">
                <div>
                    <h2 className="CreateLoan__title">Create loan offer</h2>
                    <div className="CreateLoan__input">
                        <TextField
                            value={this.state.principal}
                            onChange={(e) => this.setState({ principal: e.target.value })}
                            label="Principal"
                            variant="outlined"
                            fullWidth
                        />
                    </div>

                    <div className="CreateLoan__button">
                        <Button variant="outlined" color="primary" onClick={this.prepCreateLoanOffer}>Pay</Button>
                    </div>
                </div>
            </div>
        );
    }
}

CreateLoan.propTypes = {
    goToHomeView: PropTypes.func.isRequired,
    createLoanOffer: PropTypes.func.isRequired,
};
