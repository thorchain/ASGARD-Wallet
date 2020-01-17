// Cosmos Keyring
cosmosjs = require("@cosmostation/cosmosjs");
// TODO: Below can be replaced
cosmos = cosmosjs.network("https://lcd-do-not-abuse.cosmostation.io","cosmos-2")
import Wallet from "./cosmos-wallet"
import { EventEmitter } from "events";
const type = 'cosmos'

class CosmosKeyring extends EventEmitter {

  /* PUBLIC METHODS */

  constructor (opts = {}) {
    super()
    this.type = type
    this.wallets = []
    this.deserialize(opts)
  }

  serialize () {
    return Promise.resolve(this.wallets.map(w => w.getPrivateKey().toString('hex')))
  }

  deserialize (privateKeys = []) {
    return new Promise((resolve, reject) => {
      try {
        const keysArr = []
        keysArr.concat(privateKeys)
        this.wallets = keysArr.map((privateKey) => {
          // const stripped = ethUtil.stripHexPrefix(privateKey)
          // const buffer = new Buffer(stripped, 'hex')
          const wallet = Wallet.fromPrivateKey(privateKey)
          return wallet
        })
      } catch (e) {
        reject(e)
      }
      resolve()
    })
  }

  addAccounts (n = 1) {
    var newWallets = []
    for (var i = 0; i < n; i++) {
      
      const wallet = Wallet.generate()
      newWallets.push(wallet)
    }
    this.wallets = this.wallets.concat(newWallets)
    const hexWallets = newWallets.map((w) => {
      return w.getAddress()
    });
    return Promise.resolve(hexWallets)
  }

  getAccounts () {
    return Promise.resolve(this.wallets.map(w => {
      // ethUtil.bufferToHex(w.getAddress())
      return w.getAddress()
    }))
  }

  // tx is an instance of the ethereumjs-transaction class.
  signTransaction (address, tx, opts = {}) {
    // const privKey = this.getPrivateKeyFor(address, opts);
    // tx.sign(privKey)
    // return Promise.resolve(tx)
  }

  // For eth_sign, we need to sign arbitrary data:
  signMessage (address, data, opts = {}) {
    // const message = ethUtil.stripHexPrefix(data)
    // const privKey = this.getPrivateKeyFor(address, opts);
    // var msgSig = ethUtil.ecsign(new Buffer(message, 'hex'), privKey)
    // var rawMsgSig = ethUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    // return Promise.resolve(rawMsgSig)
  }

  // For eth_sign, we need to sign transactions:
  newGethSignMessage (withAccount, msgHex, opts = {}) {
    // const privKey = this.getPrivateKeyFor(withAccount, opts);
    // const msgBuffer = ethUtil.toBuffer(msgHex)
    // const msgHash = ethUtil.hashPersonalMessage(msgBuffer)
    // const msgSig = ethUtil.ecsign(msgHash, privKey)
    // const rawMsgSig = ethUtil.bufferToHex(sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s))
    // return Promise.resolve(rawMsgSig)
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage (address, msgHex, opts = {}) {
    // const privKey = this.getPrivateKeyFor(address, opts);
    // const privKeyBuffer = new Buffer(privKey, 'hex')
    // const sig = sigUtil.personalSign(privKeyBuffer, { data: msgHex })
    // return Promise.resolve(sig)
  }

  // For eth_decryptMessage:
  decryptMessage (withAccount, encryptedData) {
    // const wallet = this._getWalletForAccount(withAccount)
    // const privKey = ethUtil.stripHexPrefix(wallet.getPrivateKey())
    // const privKeyBuffer = new Buffer(privKey, 'hex')
    // const sig = sigUtil.decrypt(encryptedData, privKey)
    // return Promise.resolve(sig)
  }

  // For eth_decryptMessage:
  decryptMessage (withAccount, encryptedData) {
    // const wallet = this._getWalletForAccount(withAccount)
    // const privKey = ethUtil.stripHexPrefix(wallet.getPrivateKey())
    // const privKeyBuffer = new Buffer(privKey, 'hex')
    // const sig = sigUtil.decrypt(encryptedData, privKey)
    // return Promise.resolve(sig)
  }
  
  // personal_signTypedData, signs data along with the schema
  signTypedData (withAccount, typedData, opts = { version: 'V1' }) {
    // switch (opts.version) {
    //   case 'V1':
    //     return this.signTypedData_v1(withAccount, typedData, opts);
    //   case 'V3':
    //     return this.signTypedData_v3(withAccount, typedData, opts);
    //   case 'V4':
    //     return this.signTypedData_v4(withAccount, typedData, opts);
    //   default:
    //     return this.signTypedData_v1(withAccount, typedData, opts);
    // }
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v1 (withAccount, typedData, opts = {}) {
    // const privKey = this.getPrivateKeyFor(withAccount, opts);
    // const sig = sigUtil.signTypedDataLegacy(privKey, { data: typedData })
    // return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v3 (withAccount, typedData, opts = {}) {
    // const privKey = this.getPrivateKeyFor(withAccount, opts);
    // const sig = sigUtil.signTypedData(privKey, { data: typedData })
    // return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v4 (withAccount, typedData, opts = {}) {
    // const privKey = this.getPrivateKeyFor(withAccount, opts);
    // const sig = sigUtil.signTypedData_v4(privKey, { data: typedData })
    // return Promise.resolve(sig)
  }

  // get public key for nacl
  getEncryptionPublicKey (withAccount, opts = {}) {
    // const privKey = this.getPrivateKeyFor(withAccount, opts);
    // const publicKey = sigUtil.getEncryptionPublicKey(privKey)
    // return Promise.resolve(publicKey)
  }
  
  getPrivateKeyFor (address, opts = {}) {
    // if (!address) {
    //   throw new Error('Must specify address.');
    // }
    // const wallet = this._getWalletForAccount(address, opts)
    // const privKey = ethUtil.toBuffer(wallet.getPrivateKey())
    // return privKey;
  }

  // returns an address specific to an app
  getAppKeyAddress (address, origin) {
    // return new Promise((resolve, reject) => {
    //   try {
    //     const wallet = this._getWalletForAccount(address, {
    //       withAppKeyOrigin: origin,
    //     })
    //     const appKeyAddress = sigUtil.normalize(wallet.getAddress().toString('hex'))
    //     return resolve(appKeyAddress)
    //   } catch (e) {
    //     return reject(e)
    //   }
    // })
  }

  // exportAccount should return a hex-encoded private key:
  exportAccount (address, opts = {}) {
    const wallet = this._getWalletForAccount(address, opts)
    return Promise.resolve(wallet.getPrivateKey().toString('hex'))
  }

  removeAccount (address) {
    // if(!this.wallets.map(w => ethUtil.bufferToHex(w.getAddress()).toLowerCase()).includes(address.toLowerCase())){
    //   throw new Error(`Address ${address} not found in this keyring`)
    // }
    // this.wallets = this.wallets.filter( w => ethUtil.bufferToHex(w.getAddress()).toLowerCase() !== address.toLowerCase())
  }

  /* PRIVATE METHODS */

  _getWalletForAccount (account, opts = {}) {
    // const address = sigUtil.normalize(account)
    // let wallet = this.wallets.find(w => ethUtil.bufferToHex(w.getAddress()) === address)
    // if (!wallet) throw new Error('Simple Keyring - Unable to find matching address.')

    // if (opts.withAppKeyOrigin) {
    //   const privKey = wallet.getPrivateKey()
    //   const appKeyOriginBuffer = Buffer.from(opts.withAppKeyOrigin, 'utf8')
    //   const appKeyBuffer = Buffer.concat([privKey, appKeyOriginBuffer])
    //   const appKeyPrivKey = ethUtil.keccak(appKeyBuffer, 256)
    //   wallet = Wallet.fromPrivateKey(appKeyPrivKey)
    // }

    // return wallet
  }

}

CosmosKeyring.type = type
module.exports = CosmosKeyring

