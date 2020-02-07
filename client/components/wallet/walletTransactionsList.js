// UserTransactions collection
if (Meteor.isClient) {
  Template.walletTransactionsList.onCreated(function() {
    // const self = this
  });
  Template.walletTransactionsList.helpers({
    transactions () {
      const symbol = FlowRouter.getParam('symbol')
      const select = {} // For optionally filtered list
      if (symbol) { select.txAsset = symbol }
      const result =  UserTransactions.find(select,{sort: {timeStamp: -1}}).fetch()
      // const result =  UserTransactions.find(select).fetch()
      return result
    },
    sender (addr) {
      return UserAccount.findOne().address === addr ? "self" : addr
    },
    decimals (val) {
      return parseFloat(val).toFixed(2)
    }
  });
  Template.transactionsTable.helpers({
    selfAddr (addr) {
      // TODO: return to above eventually
      const acc = UserAccount.findOne()
      return acc.address === addr ? "self" : addr
    },
    shortSymbol (symbol) {
      return symbol.split("-")[0].substr(0,4)
    },
    link (hash) {
      return BNB.explorerBaseURL + "/tx/" + hash
    }
  })
}

