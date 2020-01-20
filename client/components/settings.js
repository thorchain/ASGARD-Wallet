if (Meteor.isClient) {
  Template.settings.events({
    "click [data-event='deleteVault']": function (event, self) {
      event.preventDefault();
      console.log("delete binance vault store");
      window.localStorage.removeItem("binance");
      FlowRouter.go('home')
    },
  });
}