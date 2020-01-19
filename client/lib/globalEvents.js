if (Meteor.isClient) {
  Template.body.events({
    "click [data-event='lockWallet']": function(event, self) {
      console.log("locking wallet");
    }
  })
}