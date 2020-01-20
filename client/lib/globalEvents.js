if (Meteor.isClient) {
  Template.body.events({
    "click [data-event='lockWallet']": async function(event, self) {
      console.log("locking wallet");
      // just delete the user account
      await UserAccount.remove({})
      FlowRouter.go('home')
    }
  })
}