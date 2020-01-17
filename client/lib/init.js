import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js'
BlazeLayout.setRoot('body');
Cosmos = require('@binance-chain/javascript-sdk')

import WalletController from "../components/wallet/WalletController.js";

const KeyringController = require('eth-keyring-controller')
const CosmosKeyring = require('../../imports/cosmos-simple-keyring/index.js')

// SECURITY: Does not yet implement secure store protocol
// For initial dev/testing purposes
const initState = {vault: window.localStorage.getItem("vault")};

keyringController = new KeyringController({
  keyringTypes: [CosmosKeyring],
  initState: initState
});

Wallet = new WalletController(keyringController);