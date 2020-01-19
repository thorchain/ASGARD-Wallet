// const sdk = require('@binance-chain/javascript-sdk')
// console.log(sdk)
// const BnbApiClient = require('@binance-chain/javascript-sdk');
// sdk = BNB
// import Binance from "../../lib/binance.js"; // Binance

if (Meteor.isClient) {
  Template.walletAccounts.onCreated(function() {
    const self = this
    self.State = new Meteor.Collection(null);
  
    const vault = window.localStorage.getItem("binance")
    self.setState = async function () {
      // const keyringState = await keyringController.memStore.getState()
      const doc = self.State.findOne();
      const id = doc && doc._id ? {_id: doc._id} : {};
      self.State.update(id, JSON.parse(vault), {upsert: true});
    }
    self.getVault = function () {
      // here we get the vault
    }
    console.log("created the account template");
    
    // const bnbClient = new Binance();
    const sdk = BNB.sdk
    
    let privateKey;
    if (!vault) {
      // privateKey = sdk.crypto.generatePrivateKey()
      // console.log(privateKey.toString("hex"));
      // console.log(privateKey);
      // const keystore = sdk.crypto.generateKeyStore(privateKey, "asdf")
      // console.log(keystore);
      // window.localStorage.setItem("binance", JSON.stringify(keystore));
    } else {
      // WE NEED TO UNLOCK THE VAULT
      // const doc = self.State.findOne();
      // const id = doc && doc._id ? {_id: doc._id} : {};
      // const newDoc = JSON.parse(vault)
      // self.State.update(id, newDoc, {upsert: true});
      // we need the stored private to to reconnect the client(?)
      // since we are using Binance only
      // self.setState()
      console.log("we updated the state collection");
    }
    // console.log(bnbClient);
    
    
    
    // console.log(bnbClient.setPrivateKey);

    // const res = bnbClient.setPrivateKey(privateKey)
    // const account = bnbClient.getClientKeyAddress()
    // console.log(res);
    
    // bnbClient.setPrivateKey(privateKey.toString("hex")).then(e => {
    //   console.log("did we set the key?");
      
    //   console.log(e)
    // });

    
    // const address = bnbClient.setPrivateKey(privateKey); // sender address string (e.g. bnb1...)
    // console.log(bnbClient);
    
    self.unlockVault = function () {

    }
    
    
  })
  Template.walletAccounts.helpers({

    walletState: function () {
      return UserAccount.findOne()
    },
  })
}