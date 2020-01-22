
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
      console.log("sending transaction...")
      // BNB.transfer(from, to, amount, asset).then(e => console.log(e))
      BNB.bnbClient.transfer(from, to, amount, asset).then(e => {
        console.log("something happened then...")
        console.log(e);
        
      })
    }
  });
}