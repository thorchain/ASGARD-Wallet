
// this will export a wallet class which will interact with the binance sdk


export default class Wallet {
  constructor () {
    // Abstract data sources
    // so that it can be switched out of meteor, to context or something

  }

  async setUserData (account) {
    // This inits the binance client as well
    BNB.initializeClient(account.privateKey)
    const doc = UserAccount.findOne();
    const select = doc && doc._id ? {_id: doc._id} : {};
    UserAccount.update(select, account, {upsert: true})
    await BNB.binanceTokens().then(e => {
      TokenData.batchInsert(e.data)
    })
    this.updateAccountTransactionsData()
    this.updateTokenData()
  }

  async initializeUserAccount (account) {
    // Set up the vault store
    // Then update the account
    // add teh assets etc.
    BNB.getBalances().then(e => {
      const doc = UserAccount.findOne()
      const res = e.map(function(elem, i, arr) {
        elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
        return elem
      })
      UserAccount.update({_id:doc._id},{$set: {assets:res}})
    })
    this.updateUserAccount(account)
  }
  async updateUserAccount (account) {
    // Write to client stores/context data for the user
    this.setUserData(account)
  }

  async initializeAccountTransactionsData () {
    // this will update the transactions
      await BNB.getTransactions(addr).then(res => {
        UserTransactions.remove({})
        UserTransactions.batchInsert(res.data.tx)
      })
  }
  async initializeTokenData () {
    // used for syncing tokens store to chain
    // we only need the tokens for balances?
    // get balances
    BNB.getBanaces(address)
    // loop through balances/tokens getting names etc.
    // await BNB.binanceTokens().then(e => {
    //   TokenData.batchInsert(e.data)
    // })
  }
  
}