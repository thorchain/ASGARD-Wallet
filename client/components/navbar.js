if (Meteor.isClient) {
  Template.navbar.helpers({
    isActive: function (routeName) {
      FlowRouter.watchPathChange()
      const curr = FlowRouter.current()
      return curr.route.name == routeName;
    }
  });
  Template.navbar.events({
    "click .navbar-collapse>ul>li>a:not([data-toggle])": function () {
      $(".navbar-collapse").collapse('hide');
    }
  });
}
