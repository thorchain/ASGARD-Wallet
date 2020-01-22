if (Meteor.isClient) {
  Template.walletReceive.helpers({
    account: function () {
      return UserAccount.findOne()
    }
  });
}