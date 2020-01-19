const bip39 = require('bip39')
if (Meteor.isClient) {
  
  Template.walletGenerate.onCreated(function() {
    console.log("template is created");
    var self = this;
    self.wlist = new ReactiveVar(null);

    self.setWlist = function () {
      const wlist = self.wlist.get();
      if (!wlist) {
        console.log("no word list");
        mnemonic = bip39.generateMnemonic();
        // check from: https://github.com/pedrouid/cosmos-wallet/blob/master/src/utils.ts
        // const mnemonic = bip39.entropyToMnemonic(randomBytes.toString(`hex`));
        console.log(mnemonic);
        
        self.wlist.set(mnemonic); // set the reactive var
      }
    }

    self.getWlist = function () {
      const mnemonic = self.wlist.get();
      console.log(mnemonic);
      
      return mnemonic.length ? mnemonic.split(" ") : [] ;
    }

    self.autorun(function() {
      self.setWlist();
    });
    
  });

  Template.walletGenerate.helpers({
    wordslist: function () {
      return Template.instance().getWlist();
    }
  });

  Template.walletGenerate.events({
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      const pw = event.currentTarget.password.value;
      const words = self.wlist.get();
      await keyringController.createNewVaultAndRestore(pw, words).then((e) => {
        // Wallet.addNewKeyring('cosmos');
        // we must add the cosmos keyring here...
      });
      const vault = keyringController.store.getState().vault;
      window.localStorage.setItem("vault", vault);
      FlowRouter.go('walletView');
    }
  });
}