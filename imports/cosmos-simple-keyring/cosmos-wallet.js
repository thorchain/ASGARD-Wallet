// From:
// https://github.com/ethereumjs/ethereumjs-wallet/blob/master/src/index.ts
// const cosmos = require('cosmos-lib');
// import "@binance-chain/javascript-sdk";
const cosmos = require('@binance-chain/javascript-sdk')
import { EventEmitter } from "events";
const randomBytes = require('randombytes');

function assert(val, msg) {
  if (!val) {
    throw new Error(msg || 'Assertion failed');
  }
}

class Wallet extends EventEmitter {
  constructor (priv, pub) {
    super()
    if (priv && pub) { throw new Error('Cannot supply both a private and a public key to the constructor'); }
    // TODO: Add error handling
    // TODO: Refactor
    // TODO: Add correct priv key formatting to make below work
    // if (priv) { address = cosmos.crypto.getAddressFromPrivateKey(priv) }
    // if (pub) { address = cosmos.crypto.getAddressFromPublicKey(pub) }
    // if (!cosmos.crypto.checkAddress(address)) {
    //   throw new Error('Supplied key is invalid');
    // }
    this._privKey = priv;
    this._pubKey = pub;
  }
}
Object.defineProperty(Wallet.prototype, 'privKey', {
  get: function get() {
    assert(this._privKey, 'This is a public key only wallet');
    return this._privKey;
  }
});
Object.defineProperty(Wallet.prototype, 'pubKey', {
  get: function get() {
    if (!this._pubKey) {
      const thekey = this.privKey.toString("hex")
      const pubkey = cosmos.crypto.getPublicKeyFromPrivateKey(thekey)
      const bytesKey = cosmos.utils.str2ab(pubkey)
      this._pubkey = bytesKey
    }
    return this._pubKey;
  }
});

Wallet.generate = function () {
  const wallet = new Wallet(randomBytes(32))
  return wallet
};

Wallet.prototype.getPrivateKey = function () {
  const pkey = this.privKey
  
  return this.privKey;
};

// Wallet.prototype.getPrivateKeyString = function () {
//   return ethUtil.bufferToHex(this.getPrivateKey());
// };

Wallet.prototype.getPublicKey = function () {
  return this.pubKey;
};

// Wallet.prototype.getPublicKeyString = function () {
//   // TODO: replace with cosmos equiv if possible?
//   // TESTING: This may not be necessary for our signing methods...
//   return ethUtil.bufferToHex(this.getPublicKey());
// };

Wallet.prototype.getAddress = function () {
  // TEST: replace with the Cosmos varient
  // TODO: Unless we fix why we have no pubkey,
  // this won't work as standard for pubkey only wallet
  // It will work fine until that feature is needed
  const pubKey = this.getPublicKey();
  const hexkey = this.privKey.toString("hex")
  return cosmos.crypto.getAddressFromPrivateKey(hexkey)
};

// Wallet.prototype.getAddressString = function () {
//   // TODO: replace wiht cosmos varient
//   return ethUtil.bufferToHex(this.getAddress());
// };

// Wallet.prototype.getChecksumAddressString = function () {
//   // Is there a cosmos equivelance?
//   // TEST: Confirm if needed for cosmos signing methods
//   return ethUtil.toChecksumAddress(this.getAddressString());
// };
// https://github.com/ethereum/wiki/wiki/Web3-Secret-Storage-Definition
Wallet.prototype.toV3 = function (password, opts) {
  assert(this._privKey, 'This is a public key only wallet');
  return cosmos.generateKeystore(this.getPrivateKey(), password)
};

Wallet.prototype.getV3Filename = function (timestamp) {
  /*
   * We want a timestamp like 2016-03-15T17-11-33.007598288Z. Date formatting
   * is a pain in Javascript, everbody knows that. We could use moment.js,
   * but decide to do it manually in order to save space.
   *
   * toJSON() returns a pretty close version, so let's use it. It is not UTC though,
   * but does it really matter?
   *
   * Alternative manual way with padding and Date fields: http://stackoverflow.com/a/7244288/4964819
   *
   */
  var ts = timestamp ? new Date(timestamp) : new Date();

  return ['UTC--', ts.toJSON().replace(/:/g, '-'), '--', this.getAddress().toString('hex')].join('');
};

Wallet.prototype.toV3String = function (password, opts) {
  return JSON.stringify(this.toV3(password, opts));
};

module.exports = Wallet;