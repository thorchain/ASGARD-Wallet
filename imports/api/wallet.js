import { EventEmitter } from "events";
// import { UserAccount } from '/client/lib/client_collections'
// import UserAccount from '/imports/api/collections/UserAccountCollection'
import { UserAccount, UserAssets, UserTransactions, TokenData, MarketData } from '/imports/api/collections/client_collections'
import Binance from "/imports/api/binance";
import { crypto } from '@binance-chain/javascript-sdk'
// import WalletConnect from "@trustwallet/walletconnect";
export const BNB = new Binance();
const bcrypt = require('bcryptjs');

// const argon2 = require('argon2-browser'); // confirm issue (WASM dep req not working)

export default class WalletController extends EventEmitter{
  constructor () {
    super()
    let locked = true
    this.getIsUnlocked = function () { return !locked }
    this.setIsUnlocked = function (v) { locked = v === true ? false : true }
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
    console.log("initializing transaction data");
    const genesis = 1555545600000 // TODO: change per chain (test/main etc.)
    const transactions = await this.getTxsFrom(genesis, address)
    return UserTransactions.batchInsert(transactions)
  }

  updateTransactionData = async () => {
    console.log("updating transactions");
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
    console.log("getting token data");
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
      const usr = await UserAccount.findOne()
      if (usr && usr.assets && usr.assets.length > 0) {
        const tokens = await this.getTokenData(usr.assets)
        TokenData.remove({})
        TokenData.batchInsert(tokens)
      }
  }
  watchTxsLoop = () => {
    const sleep = m => new Promise(r => setTimeout(r, m))
    const forLoop = async () => {
      for (let index = 0; index < 5; index++) {
        let res = []
        await sleep(3000)
        res = await this.updateTransactionData()
        if (res.length > 0) { break }
      }
    }
    forLoop()
  }

  initializeConn = async (address) => {
    try {
      this.connTransfer = new WebSocket("wss://testnet-dex.binance.org/api/ws");
      this.connAccount = new WebSocket("wss://testnet-dex.binance.org/api/ws");
    } catch (error) {
      // For debugging
      console.log("socket error");
      console.log(error);
      
      throw Error(error)
    }

    // subscribe transactions
    console.log("initializing sockets");
    
    this.connTransfer.onopen = (evt) => {
      this.connTransfer.send(JSON.stringify({ method: "subscribe", topic: "transfers", address: address }))
    }
    this.connTransfer.onmessage = (msg) => {
      console.log("got transfer websocket message");
      
      const data = JSON.parse(msg.data)
      console.log(data);
      // const data = JSON.parse(msg.data)
      // This data is missing too much (timestamp for instance)
      // Its possible if we want full speed to do as below, then update later
      // this has to match existing schema
      // {
      //   "stream": "transfers",
      //   "data": {
      //     "e": "outboundTransferInfo",
      //     "E": 64970606,
      //     "H": "613970E613792738E00854F06567EB7531B22C9CB033DAB4653A81DA37B4BE8B",
      //     "M": "",
      //     "f": "tbnb1ewk0yypfhuw358qw35rw059jkfym96rt7hrykm",
      //     "t": [
      //       {
      //         "o": "tbnb1u4s75mmna5mwqzkj63vye5ykq4numzrnww4rnu",
      //         "c": [
      //           {
      //             "a": "TCAN-014",
      //             "A": "77.00000000"
      //           }
      //         ]
      //       }
      //     ]
      //   }
      // }


      // the tx is not available from the tx api as soon as websocket event
      this.watchTxsLoop()

      
    }

    // subscribe account
    this.connAccount.onopen = (evt) => {
      this.connAccount.send(JSON.stringify({ method: "subscribe", topic: "accounts", address: address}));
    }
    this.connAccount.onmessage = async (msg) => {
      console.log("got websocket account message")
      const data = JSON.parse(msg.data)
      console.log(data);
      
      
      const balances = data.data.B
      const assets = balances.map(function(elem) {
        // these are the new balances
        // These mappings for account are different than http api...
        // free = f
        // frozen = r
        // locked = l
        // symbol = a
        // shortSymbol = nothing....
        //
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
      const select = account && account._id ? {_id: account._id} : {};
      // TODO: Remove UserAccount.update when fully deprecated
      UserAccount.update(select, {$set: {assets: assets}})
      this.updateUserAssetsStore(assets)
    }

  }
  updateUserAssetsStore = (assets) => {
    console.log("updating new userassets context/collection");
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
    console.log("initializing user account data");
    
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
      // TODO: Check this logic is comprehensive
      this.connAccount.close()
      this.connTransfer.close()
    }
    const account = UserAccount.findOne()
    UserAccount.update({_id:account._id},{$set: {locked: true}})
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
    // TODO: update token data
    // TODO: update market data
  }

  updateUserBalances = async () => {
    console.log("we are updating user balances");

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
      
      // const select = doc && doc._id ? {_id: doc._id} : {};
      if (balances.length > 0) {
        const doc = UserAccount.findOne();
        UserAccount.update({_id:doc._id}, {$set: {assets: balances}})
        this.updateUserAssetsStore(balances)
      }
    })
  }
  
  resetWallet = async () => {
    // SECURITY: This is descrutive removal of all user account data and keystores
    // TODO: Add confirm method, set local flag "resetting" or something prior to
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

  vaultFreezeFunds = async (amount, asset, password) => {
    console.log("starting to freeze the funds");
    // const getFee = () => {
      
    //   BNB.fees()
    //     .then((response) => {
    //       console.log(response.data);
          
    //       const fee = response.data.find((item) => {
    //         return item.msg_type === "tokensFreeze"
    //       })
    //       setFee(BNB.calculateFee(fee.fee))
    //     })
    //     .catch((error) => {
    //       console.error(error)
    //     })
    // }
    const userAccount = UserAccount.findOne()
    // const account = BNB.getAccount(userAccount.address)

    // const tx = {
    //   accountNumber: account.account_number.toString(),
    //   chainId: CHAIN_ID,
    //   sequence: account.sequence.toString(),
    // }
    // tx.freeze_order = {
    //   from: base64js.fromByteArray(crypto.decodeAddress(context.wallet.address)),
    //   symbol: SYMBOL,
    //   amount: (parseFloat(values.amount) * Math.pow(10, 8)).toString(),
    // }
    // console.log(tx);
    // lol its even easier
    // set the client key...
    

    console.log(password)
    try {
      let results
      const privateKey = await crypto.getPrivateKeyFromKeyStore(
        userAccount.keystore,
        password
      )
      BNB.bnbClient.setPrivateKey(privateKey)
      const res = await BNB.bnbTokens.freeze(userAccount.address, asset, amount)
      BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")
      console.log("succesful freeze");
      // console.log(privateKey);
      
      console.log(res);
      return res
    } catch (error) {
      throw Error(error)
    }

  }
  vaultUnfreezeFunds = () => {

      // tx.unfreeze_order = {
      //   from: base64js.fromByteArray(crypto.decodeAddress(context.wallet.address)),
      //   symbol: SYMBOL,
      //   amount: (parseFloat(values.amount) * Math.pow(10, 8)).toString(),
      // }

  }

  
}