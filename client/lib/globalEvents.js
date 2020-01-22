if (Meteor.isClient) {
  Template.body.events({
    "click [data-event='lockWallet']": async function(event, self) {
      console.log("locking wallet");
      // just delete the user account
      // TODO: Update to just remove security critical (private key)
      await UserAccount.remove({})
      FlowRouter.go('home')
    },
    "click [data-nav]": function (event, self) {
      event.preventDefault()
      const route = event.currentTarget.dataset.nav
      FlowRouter.go(route)
    }
  })
}