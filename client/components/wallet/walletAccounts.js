const sdk = require('@binance-chain/javascript-sdk')
// const BnbApiClient = require('@binance-chain/javascript-sdk');


if (Meteor.isClient) {
  Template.walletAccounts.onCreated(function() {
    const self = this
    self.State = new Mongo.Collection(null);
    const url = 'https://testnet-dex.binance.org/'
    console.log("created the account template");
    // console.log(sdk.client);
    // const rpc = new sdk('https://testnet-dex.binance.org/')
    // const rest = rpc.getAccount('bnb1qfmufc2q30cgw82ykjlpfeyauhcf5mad6p5y8t').then(x => {
    // console.log('',JSON.stringify(x))
    // console.log(x)
    // })
    const bnbClient = new sdk(url);
    const vault = window.localStorage.getItem("binance")
    if (!vault) {
      const privateKey = sdk.crypto.generatePrivateKey()
      // console.log(privateKey.toString("hex"));
      console.log(privateKey);
      const keystore = sdk.crypto.generateKeyStore(privateKey, "asdf")
      console.log(keystore);
      window.localStorage.setItem("binance", JSON.stringify(keystore));
    } else {
      const doc = self.State.findOne();
      const id = doc && doc._id ? {_id: doc._id} : {};
      const newDoc = JSON.parse(vault)
      self.State.update(id, newDoc, {upsert: true});
      console.log("we updated the state collection");
    }
    // console.log(bnbClient);
    
    
    
    // console.log(bnbClient.setPrivateKey);

    // bnbClient.setPrivateKey(privateKey.toString("hex")).then(e => {
    //   console.log("did we set the key?");
      
    //   console.log(e)
    // });

    
    // const address = bnbClient.setPrivateKey(privateKey); // sender address string (e.g. bnb1...)
    // console.log(bnbClient);
    
    self.setState = async function () {
      const keyringState = await keyringController.memStore.getState()
      const doc = State.findOne();
      const id = doc && doc._id ? {_id: doc._id} : {};
      State.update(id, keyringState, {upsert: true});
    }
    
    
  })
  Template.walletAccounts.helpers({

    walletState: function () {
      const doc = Template.instance().State.findOne();
      return doc;
    },

  })
}