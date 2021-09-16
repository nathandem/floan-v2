import { ethers } from 'ethers';
import { sql } from './postgres';
import floanAbi from '../abis/Floan.json';


const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);
const floanContract = new ethers.Contract(process.env.FLOAN_ADDRESS, floanAbi, provider);

function eventHandlers() {
    const LOAN_STATES = {
        REQUESTED: 'REQUESTED',
        FUNDED: 'FUNDED',
        WITHDRAWN: 'WITHDRAWN',
        PAYED_BACK: 'PAYED_BACK',
        CLOSED: 'CLOSED',
    };

    floanContract.on('LoanRequested', async (loanId, borrower, amountInWeiLikeDenomination, repayAmountInWeiLikeDenomination, durationInDays, lastActionBlock, event) => {
        console.log(`LoanRequested event`);
    
        // transform amounts from wei like denomination (stored in ethers's BigNumber type) to amounts in fiat (stored in regular integers)
        const amountInFiat = ethers.utils.formatEther(amountInWeiLikeDenomination);
        const repayAmountInFiat = ethers.utils.formatEther(repayAmountInWeiLikeDenomination);
    
        // ethers.js event listener sometimes take past events when initiated,
        // use `on conflict (...) do nothing` to avoid issue
        const res = await sql`
            insert into loan (
                loan_id, borrower, amount_in_fiat, repay_amount_in_fiat, duration_in_days, request_block, state
            ) values (
                ${loanId}, ${borrower}, ${amountInFiat}, ${repayAmountInFiat}, ${durationInDays}, ${lastActionBlock}, ${LOAN_STATES.REQUESTED}
            ) on conflict (loan_id) do nothing;
        `;
        console.log(res);
    });

    floanContract.on('LoanFunded', async (loanId, lender, lastActionBlock, event) => {
        console.log(`LoanFunded event`);
    
        const res = await sql`
            update loan
            set lender = ${lender},
                fund_block = ${lastActionBlock},
                state = ${LOAN_STATES.FUNDED}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });

    floanContract.on('LoanWithdrawn', async (loanId, lastActionBlock, event) => {
        console.log(`LoanWithdrawn event`);
    
        const res = await sql`
            update loan
            set withdraw_block = ${lastActionBlock},
                state = ${LOAN_STATES.WITHDRAWN}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });

    floanContract.on('LoanPaidBack', async (loanId, lastActionBlock, event) => {
        console.log(`LoanPaidBack event`);
    
        const res = await sql`
            update loan
            set payback_block = ${lastActionBlock},
                state = ${LOAN_STATES.PAYED_BACK}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });

    floanContract.on('LoanClosed', async (loanId, lastActionBlock, event) => {
        console.log(`LoanClosed event`);
    
        const res = await sql`
            update loan
            set close_block = ${lastActionBlock},
                state = ${LOAN_STATES.CLOSED}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });
}

export default eventHandlers;
