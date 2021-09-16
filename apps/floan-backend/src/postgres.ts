import postgres from 'postgres';


export const sql = postgres({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
});


// Create tables

/*
 * Notes:
 * - Amounts are represented with varchar(30) to cover until 1 trillon dai (in wei),
 *   also because storing money amounts in integer isn't a good idea for rounding errors
 *   (even if for now only full amounts)
 * - Eth addresses take 42 characters with the leading "0x"
 */
async function createLoanTableIfNotExist() {
    await sql`
        create table if not exists loan (
            loan_id int primary key,
            borrower varchar(42) not null,
            lender varchar(42),
            amount_in_fiat varchar(30) not null,
            repay_amount_in_fiat varchar(30) not null,
            duration_in_days int null,
            request_block int,
            fund_block int,
            withdraw_block int,
            payback_block int,
            close_block int,
            state varchar(20) not null
        );
    `;
}

export async function deployTablesIfNotAlreadyDeployed() {
    await createLoanTableIfNotExist();
    // add other tables here... (before moving to a more resilient system with migrations)
}
