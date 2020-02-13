if (Meteor.isClient) {
  Template.navbar.helpers({
    isActive: function (routeName) {
      FlowRouter.watchPathChange()
      const curr = FlowRouter.current()
      return curr.route.name == routeName;
    },
    isUnlocked: function () {
      const acc = UserAccount.findOne()
      return acc && acc.locked === false ? true : false
    },

  });
}
