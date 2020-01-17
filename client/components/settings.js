
if (Meteor.isClient) {
  Template.settings.events({
    "click [data-event='deleteVault']": function (event, self) {
      event.preventDefault();
      console.log("attempting to delete vault store");
      window.localStorage.removeItem("vault");
      
    },
  });
}