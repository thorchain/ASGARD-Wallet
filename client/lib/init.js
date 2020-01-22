import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';
BlazeLayout.setRoot('body');
import Binance from "/imports/api/binance.js"; // Binance
import Wallet from './wallet';
BNB = new Binance();

// WALLET = new Wallet();

Meteor.startup(function() {
  // console.log("Meteor starting...")
})
