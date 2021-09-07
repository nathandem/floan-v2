import React from "react";

import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import PaymentIcon from "@material-ui/icons/Payment";

import "./Table.css";

export default function LoanList({
    goToHomeView,
    action,
    loans,
}) {
    const rows = loans.map(loan => {
        return (
            <TableRow key={loan.loanId}>
                <TableCell>{loan.loanId}</TableCell>
                <TableCell>{loan.borrower}</TableCell>
                <TableCell>{loan.amountInFiat}</TableCell>
                <TableCell>{loan.repayAmountInFiat}</TableCell>
                <TableCell>{loan.durationInDays}</TableCell>
                <TableCell>
                    <PaymentIcon onClick={() => action(loan.loanId, loan.amountInFiat)} />
                </TableCell>
            </TableRow>
        );
    });

    return (
        <>
            <Button variant="outlined" color="primary" onClick={goToHomeView}>
                Home
            </Button>
            <div className="Table__container">
                <TableContainer>
                    <Table className="TablePage__table" aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>Borrower</TableCell>
                                <TableCell>Principal</TableCell>
                                <TableCell>Repayment</TableCell>
                                <TableCell>Duration (in days)</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>{rows}</TableBody>
                    </Table>
                </TableContainer>
            </div>
        </>
    );
}
