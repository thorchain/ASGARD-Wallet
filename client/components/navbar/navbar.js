if (Meteor.isClient) {
  Template.navbar.helpers({
    isActive: function (routeName) {
      FlowRouter.watchPathChange()
      const curr = FlowRouter.current()
      return curr.route.name == routeName;
    },
    isUnlocked: async function () {
      return WALLET.getIsUnlocked() === true ? true : false;
    }
  });
}
