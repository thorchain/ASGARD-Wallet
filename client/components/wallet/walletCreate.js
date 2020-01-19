const bip39 = require('bip39')
// import Binance from "../../lib/binance.js"; // Binance
// const bnbClient = new Binance();
if (Meteor.isClient) {
const sdk = BNB.sdk
  
  Template.walletCreate.onCreated(function() {
    var self = this;
    self.wlist = new ReactiveVar(null);
    self.isMnemonic = new ReactiveVar(false);

    self.setWlist = () => {
      const wlist = self.wlist.get();
      if (!wlist) {
        mnemonic = bip39.generateMnemonic();
        self.wlist.set(mnemonic);
      }
    }

    self.getWlistArray = () => {
      const mnemonic = self.wlist.get();
      return mnemonic.length ? mnemonic.split(" ") : [] ;
    }

    self.generateWallet = async function (pw) {
      // const res = sdk.crypto.getPrivateKeyFromMnemonic(self.wlist.get())
      // Check the vault
      const vault = window.localStorage.getItem("binance");
      console.log(typeof vault)
      if (vault) {
        // console.error("wallet exists")
        throw new Error("Wallet already exists")
      } else {
        // Generate the key/keystore/vault
        let account
        if (self.isMnemonic.get()) {
          const words = self.wlist.get();
          account = await BNB.bnbClient.recoverAccountFromMnemonic(words)
          const doc = UserAccount.findOne();
          const select = doc && doc._id ? {_id: doc._id} : {};
          account.keystore = await sdk.crypto.generateKeyStore(account.privateKey, pw)
          UserAccount.update(select, account, {upsert: true})
          // Security: Below coud output private keys
          console.log(account)
          window.localStorage.setItem("binance", JSON.stringify(account.keystore));
        } else {
          account = await BNB.bnbClient.createAccountWithKeystore(pw)
          const doc = UserAccount.findOne();
          const select = doc && doc._id ? {_id: doc._id} : {};
          UserAccount.update(select, account, {upsert: true})
          // Security: Below coud output private keys
          console.log(account)

          
          window.localStorage.setItem("binance", JSON.stringify(account.keystore));
        }
        
      }



    }

    self.setWlist();

    self.autorun(function() {
    });
    
  });

  Template.walletCreate.helpers({
    wordslist: function () {
      return Template.instance().getWlistArray();
    },
    isMnemonic: function () {
      return Template.instance().isMnemonic.get();
    }
    
  });

  Template.walletCreate.events({
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      try {
        if (!event.currentTarget.password.value) throw "no password"
        await self.generateWallet(event.currentTarget.password.value);
        FlowRouter.go('walletAccounts')
      } catch (err) {
        console.error(err);
      }
    }
  });
}