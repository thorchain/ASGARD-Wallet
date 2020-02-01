if (Meteor.isClient) {
  Template.breadcrumb.onCreated(function (params) {
    const self = this

  })

  Template.breadcrumb.helpers({
    route: function() {
      FlowRouter.watchPathChange()
      const current = FlowRouter.current()
      return current.route && current.route.options && current.route.options.back && current.route.options.back.route
    }
  })

}
