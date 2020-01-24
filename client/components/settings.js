if (Meteor.isClient) {
  Template.settings.helpers({
    downloadLink () {
      const keystore = localStorage.getItem('binance')
      return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
    }
  })

  Template.settings.events({
    "click [data-event='deleteVault']": function (event, self) {
      event.preventDefault();
      console.log("delete binance vault store");
      // We need to delete everything
      UserAccount.remove({})
      UserTransactions.remove({})
      TokenData.remove({})
      window.localStorage.removeItem("binance");
      FlowRouter.go('home')
    },
  });
}