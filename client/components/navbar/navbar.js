if (Meteor.isClient) {
  Template.navbar.helpers({
    isActive: function (routeName) {
      FlowRouter.watchPathChange()
      const curr = FlowRouter.current()
      return curr.route.name == routeName;
    },
    isUnlocked: function () {
      return WALLET.isUnlocked() === true ? true : false;
    }
  });
}
