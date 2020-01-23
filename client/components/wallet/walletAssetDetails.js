if (Meteor.isClient) {
  Template.walletAssetDetails.helpers({
    balances () {
      const symbol = FlowRouter.getParam('symbol')
      return UserAccount.findOne().assets.find(e => e.symbol === symbol)
    },
    transactions () {
      return []
    },
    token () {
      const symbol = FlowRouter.getParam('symbol')
      return TokenData.findOne({symbol: symbol})
    }
  })
}
