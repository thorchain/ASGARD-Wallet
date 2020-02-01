if (Meteor.isClient) {
  Template.mainAppFrame.onCreated(function () {
    const self = this;
    self.isVault = new ReactiveVar();

    self.setIsVault = function () {
      const vault = window.localStorage.getItem("vault");
      const val = vault ? true : false;
      self.isVault.set(val);
    }

    // first check if there is a wallet


    // if there is no wallet (in localStorage)
    // then let user choose between create/import
    
    self.autorun(function () {
      self.setIsVault();
      if (self.isVault.get()) {
        // FlowRouter.go("walletAssets");
      } else {
        // FlowRouter.go("walletCreate");
      }
    });
  });

}
