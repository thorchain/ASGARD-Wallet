
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

  initializeTokenData = async() => {
    const usr = UserAccount.findOne()
    const assets = usr.assets
    if (assets && assets.length > 0) {
      
      const symbols = assets.map(asset => {
        return asset.symbol
      })

      let page = 1;
      let tokensFound = []
      const initialOffset = 0
      const limit = 2000
      while (tokensFound.length < symbols.length) {
        let request, options = {}
        options.offset = ((page -1) * limit) + initialOffset
        options.limit = limit

        try {
          request = await BNB.getTokens(options)
        } catch (error) {
          break
        }

        if (request && request.data && request.data.length > 0) {
          // Go through the tokens
          for (let i = 0; i < request.data.length; i++) {
            const e = request.data[i];
            // Check for a match to account assets
            const match = symbols.find(s => { return s === e.symbol })
            if (match) { tokensFound.push(e) }
            if (tokensFound.length === symbols.length) { break }
            
          }
          // Safeguard
          if (request.data.length < limit) {
            break
          }
          
        }
        page+=1
      } // end while()

      TokenData.remove({})
      TokenData.batchInsert(tokensFound)

    }
  }
  
}