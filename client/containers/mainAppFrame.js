if (Meteor.isClient) {
  Template.mainAppFrame.onCreated(function () {
    const self = this;
    self.isVault = new ReactiveVar();

    self.setIsVault = function () {
      console.log("re-routing based on wallet file");
      const vault = window.localStorage.getItem("vault");
      console.log(vault);
      const val = vault ? true : false;
      self.isVault.set(val);
    }

    // first check if there is a wallet


    // if there is no wallet (in localStorage)
    // then let user choose between create/import
    
    self.autorun(function () {
      console.log("this ran?");
      self.setIsVault();
      if (self.isVault.get()) {
        FlowRouter.go("walletView");
      } else {
        FlowRouter.go("walletGenerate");
      }
    });
  });

}
