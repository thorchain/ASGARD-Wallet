import { encodeBinaryByteArray } from "@binance-chain/javascript-sdk/lib/encoder";

if (Meteor.isClient) {
  Template.walletAssets.onCreated(function() {
    const self = this;
    self.getAssets = function () {
      return BNB.getBalances().then(e => {
        const doc = UserAccount.findOne()
        UserAccount.update(doc._id,{assets:e})
      })
    }
    self.getAssets()
  })
  Template.walletAssets.helpers({
    assetsList: function () {
      // this comes from BNB client
      // const res = BNB.getBalances().then(e => console.log(e));
      // const res = Template.instance().getAssets();
      // console.log(res);
      const assets = UserAccount.findOne().assets
      console.log(assets);
      
      return assets
    }
  });
}
