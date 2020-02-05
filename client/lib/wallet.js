import { EventEmitter } from "events";
// const argon2 = require('argon2-browser'); // confirm issue (WASM dep req not working)
var bcrypt = require('bcryptjs');

export default class WalletController extends EventEmitter{
  constructor () {
    super()
    let isUnlocked = false
    this.getIsUnlocked = function () { return this.isUnlocked}
    this.setIsUnlocked = function (v) { this.isUnlocked = v === true ? true : false }
  }

  generateUserAuth = async (pw) => {
    const user = UserAccount.findOne()
    if (user) {
      // SECURITY: Using bcrypt for now. Confirm needed upgrade to argon2?
      // The UserAccount collection should never need be synced with a server
      user.pwHash = bcrypt.hashSync(pw, 8);
      UserAccount.update({_id:user._id},{$set: user})
    } else {
      throw Error('No user account intialized')
    }
    
  }

  checkUserAuth = async (pw) => {
    const user = UserAccount.findOne()
    return bcrypt.compareSync(pw, user.pwHash)
  }

  async initializeAccountTransactionsData () {
    // OLD: this will update the transactions
      await BNB.getTransactions(addr).then(res => {
        UserTransactions.remove({})
        UserTransactions.batchInsert(res.data.tx)
      })
  }

  initializeTokenData = async() => {
    console.log("initializing token data");
    
    const usr = UserAccount.findOne()
    const assets = usr.assets || null
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

  initializeUserData = async (account) => {
    console.log("initializing user account data");
    
    await BNB.initializeClient(account.privateKey)
    const doc = UserAccount.findOne();
    const select = doc && doc._id ? {_id: doc._id} : {};
    await BNB.getBalances().then(e => {
      account.assets = e.map(function(elem) {
        elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
        return elem
      })
      UserAccount.remove({})
      UserAccount.update(select, account, {upsert: true})
    })
    await BNB.bnbClient.getTransactions(account.address).then(e => {
      UserTransactions.remove({})
      UserTransactions.batchInsert(e.result.tx)
    })

    // Setup events subscription
    const conn = new WebSocket("wss://testnet-dex.binance.org/api/ws");
    conn.onopen = function (evt) {
      conn.send(JSON.stringify({ method: "subscribe", topic: "accounts", address: account.address}));
    }
    conn.onmessage = function (msg) {
      console.log("got websocket msg")
      const data = JSON.parse(msg.data)
      const balances = data.data.B
      assets = balances.map(function(elem) {
        // These mappings for account are different than http api...
        // free = f
        // frozen = r
        // locked = l
        // symbol = a
        // shortSymbol = nothing....
        //
        const asset = {
          free: elem.f,
          frozen: elem.r,
          locked: elem.l,
          symbol: elem.a
        }
        asset.shortSymbol = asset.symbol.split("-")[0].substr(0,4)
        return asset
      })
      const doc = UserAccount.findOne();
      const select = doc && doc._id ? {_id: doc._id} : {};
      UserAccount.update(select, {$set: {assets: assets}}, {upsert: true})
      // Probably we want to update transactions?
    }
  }

  initializeVault = (keystore) => {
    console.log("initializeVault")
    window.localStorage.setItem("binance", JSON.stringify(keystore));
  }


  generateAccount = async (pw, mnemonic) => {
    console.log("generateKeystore");
    
    let account
    if (mnemonic) {
      try {
        account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
        account.keystore = await BNB.sdk.crypto.generateKeyStore(account.privateKey, pw)
        // delete account.privateKey // SECURITY: imperative
      } catch (error) {
        throw new Error(error)
      }
      
    } else {
      account = await BNB.bnbClient.createAccountWithKeystore(pw)
      // delete account.privateKey // SECURITY: imperative
    }

    this.emit('walletKeystoreCreated', 'Wallet keystore created')
    return account
  }

  generateAccountFromKeystore = async (pw, keystore) => {
    return await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
  }

  generateNewWallet = async (pw, mnemonic, keystore) => {
    return new Promise(async (resolve, reject) => {
      // do a thing, possibly async, then…
      // TODO: below, refactor to store agnostic method call adapter
      const vault = window.localStorage.getItem("binance");
      let account
      
      // SECURITY: Prevent overwrite of existing vault
      if (vault) {
        throw new Error("Wallet vault already exists")
      } else {
        
        // SECURITY: TODO: Remove privatekey before storing
        try {
          // TODO: Replace with promiseAll()?
          // TODO: remove dependency on params by referencing elements instead
          if (keystore) {
            account = await this.generateAccountFromKeystore(pw, keystore)
            account.keystore = keystore
          } else {
            account = await this.generateAccount(pw, mnemonic)
          }

          await this.initializeVault(account.keystore)
          await this.initializeUserData(account)
          await this.generateUserAuth(pw)
          await this.initializeTokenData(account)
          // await this.initializeTransactionData
          //
          resolve("resolved")
        } catch (error) {
          console.log(Error(error))
          reject(Error("Error(s) in wallet generation"));
        }
        
        this.emit('completedWalletGeneration')
      }
    
    });
    

  }

  updateUserBalances = async () => {
    let balances = {}
    await BNB.getBalances().then(e => {
      balances = e.map(function(elem) {
        elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
        return elem
      })
      const doc = UserAccount.findOne();
      const select = doc && doc._id ? {_id: doc._id} : {};
      UserAccount.update(select, {$set: {assets: balances}})
    })
  }

  unlock = async (pw) => {
    console.log("unlocking...");
    // TODO: make try?
    const check = await this.checkUserAuth(pw)
    if (check) {
      this.setIsUnlocked(true)
      // syncing stuff
      // await this.updateUserBalances()
      // await this.initializeTokenData() // for now until syncing
      // this.updateTransactions()
      // this.updateTokenData()
    } else {
      
      throw Error("Incorrect password")
    }
  }

  lock = () => {
    this.setIsUnlocked(false)
    return true
  }
  isUnlocked = () => {
    return this.getIsUnlocked()
  }
  
}