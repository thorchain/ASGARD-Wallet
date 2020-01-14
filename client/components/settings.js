
if (Meteor.isClient) {
  Template.settings.events({
    "click [data-event='deleteVault']": function (event, self) {
      event.preventDefault();
      console.log("attempting to delete vault store");
      window.localStorage.removeItem("vault");
      
    },
    "click [data-event='addNewKeyring']": async function (event, self) {
      event.preventDefault();
      console.log("adding the cosmos keyring");
      // Wallet.addNewKeyring('cosmos');
      const newring = await keyringController.addNewKeyring('cosmos');
      // const newVault = await keyringController.memStore.getState();

      const newVault = await keyringController.store.getState().vault;
      console.log("ok updating keystore");
      console.log(newVault);
      
      window.localStorage.setItem("vault", newVault);
      FlowRouter.go('walletView')
    },
    "click [data-event='addNewAccount']": async function (event, self) {
      event.preventDefault();
      console.log("we are adding a new account now...")
    }
  });
}