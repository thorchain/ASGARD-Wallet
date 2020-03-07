import './navbar.html'
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
    hasFunds: function () {
      // simple check for new account
      // NOTE: Do we need to consider for 0 balances of existing accouont?
      return UserAssets.find().count() > 0
    }
  });
  Template.navbar.events({
    "click .navbar-collapse>ul>li>a:not([data-toggle])": function () {
      $(".navbar-collapse").collapse('hide');
    }
  })
}
