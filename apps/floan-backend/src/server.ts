import { sql, deployTablesIfNotAlreadyDeployed } from './postgres';
import eventHandlers from './eventsHandlers';

// CONTROLLERS

import fastifyLib from 'fastify';
const fastify = fastifyLib({ logger: false });

// TODO: add dynamic filtering based on the `status` of loans
fastify.get('/getloans', async (request, reply) => {
    const loans = await sql`
        select loan_id, borrower, lender, amount_in_fiat, repay_amount_in_fiat, duration_in_days, start_block, status
        from loan;
    `;

    const parsedLoans = loans.map(loan => ({
        loanId: loan.loan_id,
        borrower: loan.borrower,
        lender: loan.lender,
        amountInFiat: loan.amount_in_fiat,
        repayAmountInFiat: loan.repay_amount_in_fiat,
        durationInDays: loan.duration_in_days,
        startBlock: loan.start_block,
        status: loan.status,
    }));

    reply.header('Access-Control-Allow-Origin', process.env.WEB_APP_ORIGIN);
    reply.send({ loans: parsedLoans });

    return reply;
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(5000);
    } catch (err) {
        fastify.log.error(err);
    }
}

start();




// START SERVER

async function main() {
    await deployTablesIfNotAlreadyDeployed();
    
    eventHandlers();
}

// important to let the process alive, don't exit
main()
