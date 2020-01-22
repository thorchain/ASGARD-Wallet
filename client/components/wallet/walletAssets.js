
if (Meteor.isClient) {
  Template.walletAssets.onCreated(function() {
    const self = this;

    self.initAssets = function () {
      // TODO: Determine better approach for descreasing requests
      return BNB.getBalances().then(e => {
        // We also want the token info...
        // now we have TokenData
        // need the symbols...
        
        // we want to add the symbols to the assets?
        
        const doc = UserAccount.findOne()
        UserAccount.update({_id:doc._id},{$set: {assets:e}})
      })
    }
    self.getAssets = () => {
      // return the assets...
      const assets = UserAccount.findOne().assets
      if (assets && assets.length > 0) {
        
        // const symbols = assets.map(asset => {
        //   return asset.symbol
        // })
        // more efficient than in loop
        const tokens = TokenData.find().fetch() 
        // attach the token data for each asset
        const res = assets.map(function(elem) {
          // get the token asset
          const token = tokens.find(function(e) {
            return (elem.symbol === e.symbol)
          });
          elem.token = token
          elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
          return elem
        })
        return res
      }
    }

    self.initAssets()
    self.autorun(function() {

    });
  });
  Template.walletAssets.helpers({
    assetsList: function () {
      return Template.instance().getAssets()
    },
    decimals: function (val) {
      val = parseFloat(val)
      return val.toFixed(2)
    }

  });
}
