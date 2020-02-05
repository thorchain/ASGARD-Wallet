if (Meteor.isClient) {
  Template.body.events({
    "click [data-event='lockWallet']": async function(event, self) {
      await WALLET.lock()
      FlowRouter.go('home')
    },
    "click [data-event='deleteVault']": async function (event, self) {
      event.preventDefault();
      console.log("delete binance vault store");
      // We need to delete everything
      await UserAccount.remove({})
      await UserTransactions.remove({})
      await TokenData.remove({})
      await window.localStorage.removeItem("binance");
      await localforage.clear(); // persistant store
      FlowRouter.go('home')

    },
    "click [data-nav]": function (event, self) {
      event.preventDefault()
      const route = event.currentTarget.dataset.nav
      FlowRouter.go(route)
    },
    "click .navbar-collapse>ul>li>a:not([data-toggle])": function () {
      $(".navbar-collapse").collapse('hide');
    }
  })
}