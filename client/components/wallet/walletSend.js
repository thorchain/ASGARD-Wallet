
if (Meteor.isClient) {
  Template.walletSend.onCreated(function() {

  });
  Template.walletSend.helpers({
    userAssets: function () {
      return assets = UserAccount.findOne().assets
    },
    availableBalance (symbol) {
      const assets = UserAccount.findOne().assets
      return assets && assets.length > 0 ? assets.find(e => e.symbol === symbol).free : null
    },
    asset () {
      const param = FlowRouter.getParam('asset')
      const acc = UserAcount.findOne()
      console.log(acc);
      console.log(param);
      
      
      return acc.assets.find(e => { return e.symbol === param})
    },
    shortSymbol (symbol) {
      return symbol.split("-")[0].substr(0,4)
    }
  });
  Template.walletSend.events({
    "submit #send-transaction-form": function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      const from = UserAccount.findOne().address
      const to = t.recipient.value
      const amount = parseInt(t.amount.value)
      const param = FlowRouter.getParam('asset')
      const asset = param || t.asset && t.asset.value
      
      BNB.transfer(from, to, amount, asset).then(async (e) => {
        // Update balances
        // get from websockets?
        FlowRouter.go("walletAssets")
      })
    }
  });
}