// describe('.generate()', function() {
//   it('should generate an account', function() {
//     assert.strictEqual(Wallet.generate().getPrivateKey().length, 32)
//   })
//   it('should generate an account compatible with ICAP Direct', function() {
//     const max = new ethUtil.BN('088f924eeceeda7fe92e1f5b0fffffffffffffff', 16)
//     const wallet = Wallet.generate(true)
//     assert.strictEqual(wallet.getPrivateKey().length, 32)
//     assert.strictEqual(new ethUtil.BN(wallet.getAddress()).lte(max), true)
//   })
// })

module.exports = function generate () {
  // this is the function to generate the wallet
  // it strict asserts the privateKey.length is 32
  // returns a key buffer
}
