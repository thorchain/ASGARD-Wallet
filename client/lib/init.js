import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';
BlazeLayout.setRoot('body');
import Binance from "/imports/api/binance.js"; // Binance
import WalletController from './wallet';

BNB = new Binance();
WALLET = new WalletController();

FlowRouter.wait();

Meteor.startup(function() {
  FlowRouter.initialize();
  // console.log("Meteor starting...")
  // SECURITY: We always need on startup to get auth
  // this is in conjunction with routing/component security
  // const acc = UserAccount.findOne()
  // UserAccount.update({_id:acc._id},{$set: {isUnlocked: false}})
})
