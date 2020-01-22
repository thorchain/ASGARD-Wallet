
// this will export a wallet class which will interact with the binance sdk


export default class Wallet {
  constructor () {
    // Abstract data sources
    // so that it can be switched out of meteor, to context or something

  }

  async setUserData (account) {
    // This inits the binance client as well
    BNB.setPrivateKey(account.privateKey)
    const doc = UserAccount.findOne();
    const select = doc && doc._id ? {_id: doc._id} : {};
    UserAccount.update(select, account, {upsert: true})
    await BNB.binanceTokens().then(e => {
      TokenData.batchInsert(e.data)
    })
    await BNB.bnbClient.getTransactions(account.address).then(e => {
      UserTransactions.batchInsert(e.result.tx)
    })
  }
  
}