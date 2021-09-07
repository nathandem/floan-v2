import { ethers } from 'ethers';
import { sql } from './postgres';
import floanAbi from '../abis/Floan.json';


const NODE_URL = 'http://localhost:8545';  // TODO: get this value from an environment variable
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);

const FLOAN_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';  // TODO: get this value from an environment variable
const floanContract = new ethers.Contract(FLOAN_ADDRESS, floanAbi, provider);

function eventHandlers() {
    const LOAN_STATES = {
        PENDING: 'PENDING',
        FUNDED: 'FUNDED',
        WITHDRAWN: 'WITHDRAWN',
        PAYED_BACK: 'PAYED_BACK',
        CLOSED: 'CLOSED',
        SLASHED: 'SLASHED',
    };

    floanContract.on('LogRequestLoan', async (loanId, borrower, amountInWeiLikeDenomination, repayAmountInWeiLikeDenomination, durationInDays, event) => {
        console.log(`LogRequestLoan event`);
    
        // transform amounts from wei like denomination (stored in ethers's BigNumber type) to amounts in fiat (stored in regular integers)
        const amountInFiat = ethers.utils.formatEther(amountInWeiLikeDenomination);
        const repayAmountInFiat = ethers.utils.formatEther(repayAmountInWeiLikeDenomination);
    
        // ethers.js event listener sometimes take past events when initiated,
        // use `on conflict (...) do nothing` to avoid issue
        const res = await sql`
            insert into loan (
                loan_id, borrower, amount_in_fiat, repay_amount_in_fiat, duration_in_days, status
            ) values (
                ${loanId}, ${borrower}, ${amountInFiat}, ${repayAmountInFiat}, ${durationInDays}, ${LOAN_STATES.PENDING}
            ) on conflict (loan_id) do nothing;
        `;
        console.log(res);
    });
    
    floanContract.on('LogFundLoan', async (loanId, lender, startBlock, event) => {
        console.log(`LogFundLoan event`);
    
        const res = await sql`
            update loan
            set lender = ${lender},
                start_block = ${startBlock},
                status = ${LOAN_STATES.FUNDED}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });
    
    floanContract.on('LogLoanWithdrawn', async (loanId, event) => {
        console.log(`LogLoanWithdrawn event`);
    
        const res = await sql`
            update loan
            set status = ${LOAN_STATES.WITHDRAWN}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });
    
    floanContract.on('LogPaybackLoan', async (loanId, event) => {
        console.log(`LogPaybackLoan event`);
    
        const res = await sql`
            update loan
            set status = ${LOAN_STATES.PAYED_BACK}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });
    
    floanContract.on('LogClosedLoan', async (loanId, event) => {
        console.log(`LogClosedLoan event`);
    
        const res = await sql`
            update loan
            set status = ${LOAN_STATES.CLOSED}
            where loan_id = ${loanId};
        `;
        console.log(res);
    });
}

export default eventHandlers;
