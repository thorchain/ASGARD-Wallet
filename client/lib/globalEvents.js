if (Meteor.isClient) {
  Template.body.events({
    "click [data-event='lockWallet']": async function(event, self) {
      console.log("locking wallet");
      // just delete the user account
      // TODO: Update to just remove security critical (private key)
      // This be wrong.

      // we should add a flag? only? This is keytring controller style
      const acc = UserAccount.findOne()
      console.log(acc);
      WALLET.lock()
      // await UserAccount.update({_id:acc._id},{$set: {isUnlocked: false}})
      // await UserAccount.remove({})
      // FlowRouter.go('home')
    },
    "click [data-event='deleteVault']": function (event, self) {
      event.preventDefault();
      console.log("delete binance vault store");
      // We need to delete everything
      UserAccount.remove({})
      UserTransactions.remove({})
      TokenData.remove({})
      window.localStorage.removeItem("binance");
      FlowRouter.go('home')
      localforage.clear();

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