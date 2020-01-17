if (Meteor.isClient) {
  
  Template.walletImport.events({
    "submit #wallet-import-form": async function (event, self) {
      event.preventDefault()
      const pw = event.currentTarget.password.value;
      const words = event.currentTarget.mnemonic.value;

      await keyringController.createNewVaultAndRestore(pw, words).then((e) => {
        // code...
      });
      const vault = keyringController.store.getState().vault;
      window.localStorage.setItem("vault", vault);
      FlowRouter.go('walletView');
    }
  });
}