import React from 'react';
import { ethers } from "ethers";

import Landing from './Landing';
import FLoan from './floan/FLoan';

import './App.css';


export default class App extends React.PureComponent {

    state = {
        provider: null,
        signer: null,
        signerAddress: null,
    };

    componentDidMount = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        this.setState({ provider }, async () => {
            if (await this._isMetaMaskAccountConnected()) {
                const signer = this.state.provider.getSigner();
                const signerAddress = await signer.getAddress();
                this.setState({ signerAddress, signer });
            }
        });

        // later:
        // 1. show error message if `ethereum.isMetaMask` is false => https://docs.metamask.io/guide/ethereum-provider.html
        // 2. on account or chain change, reload the page (https://docs.metamask.io/guide/ethereum-provider.html#events)
        // 3. allow user to disconnect their account
    }

    _isMetaMaskAccountConnected = async () => {
        // note: provider.getSigner() always returns a signer, so `listAccounts` is the only way
        const accounts = await this.state.provider.listAccounts();
        return accounts.length > 0;
    }

    connectWallet = async () => {
        // Command to prompt the user to connect his account with metamask
        await this.state.provider.send("eth_requestAccounts", []);
        const signer = this.state.provider.getSigner();
        const signerAddress = await signer.getAddress();

        this.setState({ signerAddress, signer });
    }

    render() {
        return (
            <div className="App__container">
                {!this.state.signer ?
                    <Landing connectWallet={this.connectWallet} /> :
                    <FLoan {...this.state} />
                }
            </div>
        );
    }
}
