import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';
BlazeLayout.setRoot('body');
import Binance from "/imports/api/binance.js"; // Binance
import WalletController from './wallet';
BNB = new Binance();

// NOTE: Below becomes more and more like KeyringController
// when starting to support mulitple key types
WALLET = new WalletController();


Meteor.startup(function() {
  // console.log("Meteor starting...")
  // SECURITY: We always need on startup to get auth
  // this is in conjunction with routing/component security
  // const acc = UserAccount.findOne()
  // UserAccount.update({_id:acc._id},{$set: {isUnlocked: false}})
})
