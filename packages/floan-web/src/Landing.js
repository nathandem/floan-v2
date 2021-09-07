import React from 'react';

import Button from '@material-ui/core/Button';

import './Landing.css';


export default function Landing({ connectWallet }) {
    return (
        <div className="Landing__container">
            <div>
                <section>
                    <h1>fLoan: uncolleteralized loans made real</h1>
                </section>
                <div className="Landing__connectButton">
                    <Button variant="outlined" onClick={connectWallet}>Connect wallet</Button>
                </div>
            </div>
        </div>
    );
}
