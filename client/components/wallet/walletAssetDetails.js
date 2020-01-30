if (Meteor.isClient) {
  Template.walletAssetDetails.helpers({
    balances () {
      const symbol = FlowRouter.getParam('symbol')
      const res = UserAccount.findOne().assets.find(e => e.symbol === symbol)
      res.full = parseFloat(res.free) + parseFloat(res.locked) + parseFloat(res.frozen)
      return res
    },
    token () {
      const symbol = FlowRouter.getParam('symbol')
      return TokenData.findOne({symbol: symbol})
    }
  })
}
