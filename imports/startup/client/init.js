import { FlowRouter } from 'meteor/kadira:flow-router';
import WalletController from '/imports/api/wallet';
import '/imports/lib/schemas/schemasInit'


export const WALLET = new WalletController();

FlowRouter.wait();

Meteor.startup(function() {
  // Meteor.disconnect() // Enable for client only operation
  FlowRouter.initialize();
})
