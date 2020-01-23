if (Meteor.isClient) {
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