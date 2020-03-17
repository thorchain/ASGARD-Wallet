import { FlowRouter } from 'meteor/kadira:flow-router';
// import Binance from "/imports/api/binance"; // Binance
import WalletController from '/imports/api/wallet';
import '/imports/lib/schemas/schemasInit'

// export const BNB = new Binance();
export const WALLET = new WalletController();

FlowRouter.wait();

Meteor.startup(function() {
  FlowRouter.initialize();
})
