if (Meteor.isClient) {
  Template.settings.helpers({
    downloadLink () {
      const keystore = localStorage.getItem('binance')
      return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
    },
  })

  Template.settings.events({
  });
}