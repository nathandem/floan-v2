import PropTypes from 'prop-types';
import React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import './CreateLoan.css';


export default class CreateLoan extends React.PureComponent {

    state = {
        amountInFiat: '',
        repayAmountInFiat: '',
        durationInDays: '',
    };

    prepCreateLoanOffer = () => {
        const parsedDurationInDays = parseInt(this.state.durationInDays, 10);

        this.props.createLoanOffer(this.state.amountInFiat, this.state.repayAmountInFiat, parsedDurationInDays);
    }

    render() {
        return (
            <div className="CreateLoan__container">
                <div>
                    <Button variant="outlined" color="primary" onClick={this.props.goToHomeView}>Home</Button>
                    <h2 className="CreateLoan__title">Create loan offer</h2>
                    <div className="CreateLoan__input">
                        <TextField
                            value={this.state.amountInFiat}
                            onChange={(e) => this.setState({ amountInFiat: e.target.value })}
                            label="Principal"
                            variant="outlined"
                            fullWidth
                        />
                    </div>
                    <div className="CreateLoan__input">
                        <TextField
                            value={this.state.repayAmountInFiat}
                            onChange={(e) => this.setState({ repayAmountInFiat: e.target.value })}
                            label="Repayment (prin + interest)"
                            variant="outlined"
                            fullWidth
                        />
                    </div>
                    <div className="CreateLoan__input">
                        <TextField
                            value={this.state.durationInDays}
                            onChange={(e) => this.setState({ durationInDays: e.target.value })}
                            label="Duration (days)"
                            variant="outlined"
                            fullWidth
                        />
                    </div>

                    <div className="CreateLoan__button">
                        <Button variant="outlined" color="primary" onClick={this.prepCreateLoanOffer}>Create</Button>
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
