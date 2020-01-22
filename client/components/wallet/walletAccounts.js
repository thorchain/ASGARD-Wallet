// const sdk = require('@binance-chain/javascript-sdk')
// console.log(sdk)
// const BnbApiClient = require('@binance-chain/javascript-sdk');
// sdk = BNB
// import Binance from "../../lib/binance.js"; // Binance

if (Meteor.isClient) {
  Template.walletAccounts.onCreated(function() {

  });

  Template.walletAccounts.helpers({
    user: function () {
      return UserAccount.findOne()
    },
    client: function() {
      return BNB.bnbClient
    }
  })
}