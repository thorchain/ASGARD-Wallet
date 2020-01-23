import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';
BlazeLayout.setRoot('body');
import Binance from "/imports/api/binance.js"; // Binance
import Wallet from './wallet';
BNB = new Binance();

// NOTE: Below becomes more and more like KeyringController
// when starting to support mulitple key types
// WALLET = new Wallet([BNB]);


Meteor.startup(function() {
  // console.log("Meteor starting...")
})
