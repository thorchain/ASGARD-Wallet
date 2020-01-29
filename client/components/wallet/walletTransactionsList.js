// UserTransactions collection
if (Meteor.isClient) {
  Template.walletTransactionsList.onCreated(function() {
    const self = this
    self.setTransactions = async () => {
      // UPDATE: More options need to be passed to the api to handle limitations
      // https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions
      // 60 queries/min, 3 month max date window, default last 24 hrs
      // https://www.epochconverter.com/
      // genesis time 1555545600000
      // next 3 months is 1563408000000
      // 3 months in miliseconds: 7862400000
      // Latest relevant time (near beginning of 2012): 1577880000000
      //
      const opts = {}
      /// TODO: Loop through time (3 month api limit)
      opts.startTime = 1577880000000
      const addr = UserAccount.findOne().address
      const res = await BNB.getTransactions(addr, opts)
      const count = UserTransactions.find().count()
      if (count === 0) {
        // we need to initialize tx data
        UserTransactions.batchInsert(res.data.tx)
      } else {
        // TODO: we need to sync, for now re just re-initialize
        UserTransactions.remove({})
        UserTransactions.batchInsert(res.data.tx)
      }
    } // end setTransactions()

    
    self.setTransactions()
  });
  Template.walletTransactionsList.helpers({
    transactions () {
      const symbol = FlowRouter.getParam('symbol')
      const select = {}
      if (symbol) {
        select.txAsset = symbol
      }
      // we want to add a filter here
      return UserTransactions.find(select).fetch()
    },
    sender (addr) {
      const acc = UserAccount.findOne()
      return acc.address === addr ? "self" : addr
    },
    decimals (val) {
      val = parseFloat(val)
      return val.toFixed(2)
    },
  });
  Template.transactionsTable.helpers({
    selfAddr (addr) {
      const acc = UserAccount.findOne()
      return acc.address === addr ? "self" : addr
    },
    shortSymbol (symbol) {
      return symbol.split("-")[0].substr(0,4)
    }
  })
}

