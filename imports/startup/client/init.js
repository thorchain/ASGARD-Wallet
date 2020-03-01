import { FlowRouter } from 'meteor/kadira:flow-router';
import 'bootstrap';
import Popper from 'popper.js';
window.Popper = Popper;
import '@fortawesome/fontawesome-free/js/all.min.js';
// import Binance from "/imports/api/binance"; // Binance
import WalletController from '/imports/api/wallet';

// export const BNB = new Binance();
export const WALLET = new WalletController();

FlowRouter.wait();

Meteor.startup(function() {
  FlowRouter.initialize();
})
