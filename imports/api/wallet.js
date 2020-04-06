import { EventEmitter } from "events";
import { UserAccount, UserAssets, UserTransactions, TokenData, MarketData } from '/imports/api/collections/client_collections'
import Binance from "/imports/api/binance";
import { crypto } from '@binance-chain/javascript-sdk'
export const BNB = new Binance();
const bcrypt = require('bcryptjs');

export default class WalletController extends EventEmitter{
  constructor () {
    super()
    let locked = true
    this.getIsUnlocked = function () { return !locked }
    this.setIsUnlocked = function (v) { locked = v === true ? false : true }
    let connected = navigator.onLine || false
    this.getConnected = function () { return connected }
    this.setConnected = function (v) { connected = v === true ? true : false }
  }
  isUnlocked () { return this.getIsUnlocked() }

  generateUserAuth = async (pw) => {
    const user = UserAccount.findOne()
    if (user) {
      // SECURITY: Using bcrypt for now. Confirm needed upgrade to argon2? (issues in client?)
      // The UserAccount collection should never need be synced with a server
      user.pwHash = bcrypt.hashSync(pw, 8)
      UserAccount.update({_id:user._id},{$set: user})
    } else {
      throw Error('Unable to intialize account auth')
    }
    
  }

  checkUserAuth = async (pw) => {
    const user = UserAccount.findOne()
    return bcrypt.compareSync(pw, user.pwHash)
  }

  getTxsFrom = async (start, address) => {
    // https://docs.binance.org/api-reference/dex-api/paths.html#apiv1transactions
    // 60 queries/min, 3 month max date window, default last 24 hrs
    // https://www.epochconverter.com/
    // next 3 months is 1563408000000
    // 3 months in miliseconds: 7862400000 (confirm actual "months"? 2592000000)
    // Latest relevant time (near beginning of 2012): 1577880000000
    // start = 1577880000000
    // we use 89 day window, api docs are unclear as what 3 months is
    
    const inc = 89 * 24 * 60 * 60 * 1000
    const date = new Date();
    const now = date.getTime();
    const opts = { startTime : start, endTime : start + inc }
    let txs = []

    while (opts.startTime < now) {
      const res = await BNB.getTransactions(address, opts)
      txs = txs.concat(res.data.tx)
      opts.endTime += inc // this cannot go beyond now?
      opts.startTime += inc
    } ;
    return txs
  }


  initializeTransactionData = async (address) => {
    console.log("initializing transaction data...");
    const genesis = 1555545600000 // TODO: change per chain (test/main etc.)
    const transactions = await this.getTxsFrom(genesis, address)
    return UserTransactions.batchInsert(transactions)
  }

  updateTransactionData = async () => {
    console.log("updating transactions...");
    const address = UserAccount.findOne().address
    const lastTx = UserTransactions.find({},{sort: {timeStamp: -1}, limit: 1}).fetch()
    let epoch, d, transactions

    if (lastTx[0]) {
      
      d = new Date(lastTx[0].timeStamp);
      epoch = d.getTime() + 1 // add 1 ms to ensure not getting this same tx
    } else {
      epoch = 1555545600000 // genesis
    }
    const txs = await this.getTxsFrom(epoch, address)
    const txHashes = txs.map(e => {
      return e.txHash
    })

    const duplicates = UserTransactions.find({txHash:{$in:txHashes}}).fetch()
    if (duplicates.length > 0) {
      console.log("we found duplicate transactions!");
      transactions = txs.filter(e => {
        return duplicates.find(f => { return e.txHash !== f.txHash})
      })
    } else {transactions = txs}
    
    // TODO: Filter for existing txs
    if (transactions.length > 0) {
      return UserTransactions.batchInsert(transactions)
    } else {
      return []
    }
      
  }

  getClient = () => {
    return BNB.bnbClient
  }

  getTokenData = async (assets) => {
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

      return tokensFound
    }
  }

  initializeTokenData = async() => {
    console.log("initializing token data...");
    const usr = await UserAccount.findOne()
    if (usr && usr.assets && usr.assets.length > 0) {
      const tokens = await this.getTokenData(usr.assets)
      TokenData.remove({})
      TokenData.batchInsert(tokens)
    }
  }
  watchTxsLoop = async () => {
    // IF this is running, just extend it to a max amount
    // track as member to class
    if (this.txTicks) {
      if (this.txTicks <= 10) { this.txTicks += 8 }
    } else {
      this.txTicks = 8 // value for looping
      const sleep = m => new Promise(r => setTimeout(r, m))
      const forLoop = async () => {
        for (let index = 0; index < this.txTicks; index++) {
          let res = []
          await sleep(3000)
          res = await this.updateTransactionData()
          if (res.length > 0) { this.txTicks = null; break; }
        }
      }

      forLoop()
    }
  }

  initializeConn = async (address) => {
    console.log("initializing sockets...");
    try {
      // todo: do we need to use '/stream' ?
      this.conn = new WebSocket('wss://testnet-dex.binance.org/api/ws')
    } catch (error) {
      // For debugging
      console.log("socket error");
      console.log(error);
      
      throw Error(error)
    }

    // subscribe transactions
    
    this.conn.onopen = (evt) => {
      this.setConnected(true)
      console.log("socket connected")
      this.conn.send(JSON.stringify({ method: "subscribe", topic: "transfers", address: address }))
      this.conn.send(JSON.stringify({ method: "subscribe", topic: "accounts", address: address}));
    }
    this.conn.onerror = (msg) => {this.setConnected(false)}
    this.conn.onclose = (msg) => {this.setConnected(false)}
    
    this.conn.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      switch (data.stream) {
        case "accounts":
          this.connHandleAccountMessage(data)
          break;
        case "transfers":
          this.connHanleTransferMessage(data)
          break;
      
        default:
          break;
      }
      // delay between ws broadcast & blockchain confirmation
      this.watchTxsLoop()
    }

  }
  connHandleAccountMessage = async (data) => {
      const balances = data.data.B
      const assets = balances.map(function(elem) {
        // these are the new balances
        // These mappings for account ws are different than REST api...
        const asset = {
          free: parseFloat(elem.f),
          frozen: parseFloat(elem.r),
          locked: parseFloat(elem.l),
          symbol: elem.a
        }
        asset.shortSymbol = asset.symbol.split("-")[0].substr(0,4)
        return asset
      })
      // IF this is a new asset, then we need to get the token data
      // TODO: replace with 'updateTokenData()' method
      const account = UserAccount.findOne();
      if (assets.length !== account.assets.length) {
        // Check to only add new tokens
        const newTokens = await this.getTokenData(assets) // is this potentially bug?
        const oldTokens = await TokenData.find().fetch()
        const addTokens = newTokens.filter(e => {
          return !(oldTokens.find(f => {return e.symbol === f.symbol}))
        })
        TokenData.batchInsert(addTokens)
      }
      // const select = account && account._id ? {_id: account._id} : {};
      // This method should only ever be called after instatiation of wallet/account
      // Refactor into seperate 'updateUserAccount' method
      UserAccount.update({_id: account._id}, {$set: {assets: assets}})
      this.updateUserAssetsStore(assets)



    // this.watchTxsLoop()
  }
  connHanleTransferMessage = () => {
    // TODO: parse ws event and pre-load tx with 'unconfirmed' status
    // this will need to be updated later after the actual tx even is in block
    //   // This data is missing too much (timestamp for instance)
    //   // Its possible if we want full speed to do as below, then update later
    //   // this has to match existing schema
    //   // {
    //   //   "stream": "transfers",
    //   //   "data": {
    //   //     "e": "outboundTransferInfo",
    //   //     "E": 64970606,
    //   //     "H": "613970E613792738E00854F06567EB7531B22C9CB033DAB4653A81DA37B4BE8B",
    //   //     "M": "",
    //   //     "f": "tbnb1ewk0yypfhuw358qw35rw059jkfym96rt7hrykm",
    //   //     "t": [
    //   //       {
    //   //         "o": "tbnb1u4s75mmna5mwqzkj63vye5ykq4numzrnww4rnu",
    //   //         "c": [
    //   //           {
    //   //             "a": "TCAN-014",
    //   //             "A": "77.00000000"
    //   //           }
    //   //         ]
    //   //       }
    //   //     ]
    //   //   }
    //   // }
  }

  updateUserAssetsStore = (assets) => {
    console.log("updating user assets...");
    // we need to find the assets that changed
    const oldAssets = UserAssets.find().fetch()
    const changed = assets.filter((asset) => {
      // get current balances
      const existingAsset = oldAssets.find(e => {return asset.symbol === e.symbol})
      if (!existingAsset) {
        return true // new asset/token
      }
      // New balance then there is update needed
      return asset.free !== existingAsset.free ||
             asset.locked !== existingAsset.locked ||
             asset.frozen !== existingAsset.frozen
    })
    
    // Account for swaps etc. with potentially 2 or more changes
    for (let index = 0; index < changed.length; index++) {
      const element = changed[index];
      UserAssets.update({symbol:element.symbol},{$set: element},{upsert: true})
      
    }
    
  }

  initializeUserAccount = async (account) => {
    console.log("initializing user account data...");
    
    await BNB.getBalances(account.address).then(e => {
      if (e.length > 0) {
        
        account.assets = e.map(function(elem) {
          elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
          elem.free = parseFloat(elem.free)
          elem.frozen = parseFloat(elem.frozen)
          elem.locked = parseFloat(elem.locked)
          return elem
        })
        
      } else {
        account.assets = []
      }
      
      UserAccount.remove({})
      UserAccount.insert(account)
      UserAssets.remove({})
      UserAssets.batchInsert(account.assets)
    })

  }

  initializeVault = (keystore) => {
    console.log("initializing vault...")
    window.localStorage.setItem("binance", JSON.stringify(keystore));
  }


  generateAccount = async (pw, mnemonic) => {
    console.log("generateing keystore...");
    
    let account
    if (mnemonic) {
      try {
        account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
        account.keystore = await BNB.sdk.crypto.generateKeyStore(account.privateKey, pw)
        delete account.privateKey // SECURITY: imperative
      } catch (error) {
        throw new Error(error)
      }
      
    } else {
      account = await BNB.bnbClient.createAccountWithKeystore(pw)
      delete account.privateKey // SECURITY: imperative
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
        
        try {
          // TODO: Replace with promiseAll()?
          // TODO: remove dependency on params by referencing local elements instead
          if (keystore) {
            // this is where passwor errors come
            account = await this.generateAccountFromKeystore(pw, keystore)
            delete account.privateKey // SECURITY: imperative
            account.keystore = keystore
          } else {
            account = await this.generateAccount(pw, mnemonic)
          }

          // Sequnce is arbitrary and necessary
          await this.initializeVault(account.keystore)
          await this.initializeUserAccount(account)
          await this.generateUserAuth(pw)
          
          // above ^ required prior to below 
          await this.initializeTokenData(account)
          await this.initializeTransactionData(account.address)
          // Binance network websocket
          await this.initializeConn(account.address)
          //
          resolve("resolved")
        } catch (error) {
          console.log(Error(error))
          reject(Error(error));
        }
        
        this.emit('completedWalletGeneration')
      }
    
    });
    

  }


  lock = () => {
    if (this.getIsUnlocked() === true) {
      this.conn.close()
    }
    // handle if this is broken data source during wallet reset
    // we unlock before reset in case the reset fails
    const account = UserAccount.findOne()
    if (account && account._id) {
      UserAccount.update({_id:account._id},{$set: {locked: true}})
    }
    this.setIsUnlocked(false)
    return true
  }
  unlock = async (pw) => {
    // intended only for just created wallets, no sync, no init conn
    const check = await this.checkUserAuth(pw)
    // const account = UserAccount.findOne()
    if (check) {
      await BNB.initializeClient() // pubkey only?
      this.setIsUnlocked(true) // SECURITY: leave last
      const account = UserAccount.findOne()
      UserAccount.update({_id:account._id},{$set: {locked: false}})
    } else {
      
      throw Error("Incorrect password")
    }
  }
  unlockAndSync = async (pw) => {
    const account = UserAccount.findOne()
    if (await this.checkUserAuth(pw)) {
      try {

        await BNB.initializeClient() // pubkey only?
        await this.initializeConn(account.address) // this should fail gracefully for offline use
        await this.syncUserData()
        this.setIsUnlocked(true) // SECURITY: leave last
        UserAccount.update({_id:account._id},{$set: {locked: false}})
        
      } catch (error) {
        throw Error(error)
      }
    } else {
      // TODO: overly assumptive, handle errors better
      throw Error("Incorrect password")
    }

  }

  syncUserData = async () => {
    // This can be called after unlock
    // potentially automaticallyl do this on unlock
    await this.updateUserBalances()
    await this.updateTransactionData()
    // TODO: update token data. Is this necessary?
    // TODO: update market data
  }

  updateUserBalances = async () => {
    console.log("updating user balances");

    const user = UserAccount.findOne()
    let balances = {}
    await BNB.getBalances(user.address).then(e => {
      balances = e.map(function(elem) {
        elem.shortSymbol = elem.symbol.split("-")[0].substr(0,4)
        elem.free = parseFloat(elem.free)
        elem.frozen = parseFloat(elem.frozen)
        elem.locked = parseFloat(elem.locked)
        return elem
      })
      
      if (balances.length > 0) {
        const doc = UserAccount.findOne();
        UserAccount.update({_id:doc._id}, {$set: {assets: balances}})
        this.updateUserAssetsStore(balances)
      }
    })
  }
  
  resetWallet = async () => {
    // SECURITY: This is descrutive removal of all user account data and keystores
    // TODO: Add a second 'confirmResetWallet()' method
    // set local member/flag "resetting" or something prior executing below
    try {
      this.lock() // this is to flag for app security
      await UserAccount.remove({})
      await UserTransactions.remove({})
      await TokenData.remove({})
      await MarketData.remove({})
      await window.localStorage.removeItem("binance"); // vault
      await localforage.clear(); // persistant store
      return true
    } catch (error) {
      throw Error(error)
    }
  }

  transferFunds = async (sender, recipient, amount, asset, password) => {
    console.log('sending from wallet method...')
    const userAccount = UserAccount.findOne()

        try {
          let keystore = window.localStorage.getItem("binance")
          
          let privateKey = BNB.sdk.crypto.getPrivateKeyFromKeyStore(keystore, password)
          password = null // SECURITY: unset
          await BNB.bnbClient.setPrivateKey(privateKey, true)
          privateKey = null // SECURITY: unset

          // setLoadingMsg("sending tx")
          console.log("emitting...")
          this.emit('transfer','Sending funds')
          
          BNB.transfer(sender, recipient, amount, asset).then((e) => {
            // await BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")// SECURITY: Unset with useless key... remove when replaced with raw tx
            return true
          }).catch((e) => {
            // await BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")// SECURITY: Unset with useless key... remove when replaced with raw tx
            console.log(e.message);
            
            if (e.message.includes("insufficient fund")) { // this is how insufficient fees return
              if (e.message.includes("fee needed")) {
                const res = e.message.split("but")[1].trim().split(" ")[0]
                const amount = res.substring(0, res.length - 3)
                const num = parseInt(amount)
                // TODO: Add to form validation, get the fee schedule ahead of actually accessing client
                const fee = BNB.calculateFee(num)
                throw Error('Insufficient fee funds: ' + fee + ' (BNB) required')
              } else {
                // What other errors are there?
              }

            } else if (e.message.includes("<")) { // this is how insuficient funds return
              throw Error('Insufficient funds')
            } else {
              throw Error(e)
            }

          })
          
        } catch (error) {
          throw Error(error)
        }

  }

  vaultFreezeFunds = async (amount, asset, password) => {
    const userAccount = UserAccount.findOne()
    try {
      const privateKey = await crypto.getPrivateKeyFromKeyStore( userAccount.keystore, password)
      await BNB.bnbClient.setPrivateKey(privateKey)
      await BNB.bnbTokens.freeze(userAccount.address, asset, amount)
      // .then((e) => {
      //       BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")
      // }).catch((e) => {
      // })
      // SECURITY: This creates errors, as key swap happens too soon...
      // TODO: private key should be unset
      // await BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")
      
      // return res
    } catch (e) {
      // return Error(error)

            if (e.message.includes("insufficient fund")) {
              let msg
              if (e.message.includes("fee needed")) {
                // get the amount.
                const res = e.message.split("but")[1].trim().split(" ")[0]
                // const res2 = res.split(" ")
                const amount = res.substring(0, res.length - 3)
                const num = parseInt(amount)
                const fee = BNB.calculateFee(num)
                
                msg = "Insufficient fee funds: " + fee + " (BNB) required"
                // self.formErrors.set("amount","Insufficient fee funds: " + fee + " (BNB) required");
              } else {
                msg = "Error freezing funds"
              }
              throw Error(msg)

            } else if (e.message.includes("<")) { // this is how insuficient funds come back
              const res = e.message.split(",").find(f => { return f.includes("<")} )
              // TODO: Handle all errors
              throw Error("Insufficient funds");
            }
      throw Error(e)
    }

  }
  vaultUnfreezeFunds = async (amount, asset, password) => {
    const userAccount = UserAccount.findOne()
    try {
      const privateKey = await crypto.getPrivateKeyFromKeyStore( userAccount.keystore, password)
      await BNB.bnbClient.setPrivateKey(privateKey)
      await BNB.bnbTokens.unfreeze(userAccount.address, asset, amount)
      // SECURITY: This creates errors, as key swap happens too soon...
      // TODO: private key should be unset
      // await BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")
      
    } catch (e) {
            if (e.message.includes("insufficient fund")) {
              let msg
              if (e.message.includes("fee needed")) {
                // get the amount.
                const res = e.message.split("but")[1].trim().split(" ")[0]
                // const res2 = res.split(" ")
                const amount = res.substring(0, res.length - 3)
                const num = parseInt(amount)
                const fee = BNB.calculateFee(num)
                
                msg = "Insufficient fee funds: " + fee + " (BNB) required"
                // self.formErrors.set("amount","Insufficient fee funds: " + fee + " (BNB) required");
              } else {
                msg = "Error freezing funds"
              }
              throw Error(msg)

            } else if (e.message.includes("<")) { // this is how insuficient funds come back
              const res = e.message.split(",").find(f => { return f.includes("<")} )
              // TODO: Handle all errors
              throw Error("Insufficient funds");
            }
      throw Error(e)
    }
  }


  
}