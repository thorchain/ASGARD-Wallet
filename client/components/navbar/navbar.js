if (Meteor.isClient) {
  Template.navbar.helpers({
    isActive: function (routeName) {
      FlowRouter.watchPathChange()
      const curr = FlowRouter.current()
      return curr.route.name == routeName;
    },
    isUnlocked: function () {
      // Temporary logic: Change to match
      const usr = UserAccount.findOne()
      return usr && usr.privateKey ? true : false
    }
  });
  Template.navbar.events({
  });
}
