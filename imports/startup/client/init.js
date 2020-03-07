import { FlowRouter } from 'meteor/kadira:flow-router';
// import Binance from "/imports/api/binance"; // Binance
import WalletController from '/imports/api/wallet';

// export const BNB = new Binance();
export const WALLET = new WalletController();

FlowRouter.wait();

Meteor.startup(function() {
  FlowRouter.initialize();
})
