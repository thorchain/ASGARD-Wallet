if (Meteor.isClient) {
  Template.walletAccounts.onCreated(function() {

  });

  Template.walletAccounts.helpers({
    user: function () {
      return UserAccount.findOne()
    },
    client: function() {
      return BNB.bnbClient
    },
    shortSymbol (symbol) {
      return symbol.split("-")[0].substr(0,4)
    },
    downloadLink () {
      const keystore = localStorage.getItem('binance')
      return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
    },
  })
}