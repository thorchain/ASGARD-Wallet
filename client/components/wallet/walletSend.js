
if (Meteor.isClient) {
  Template.walletSend.onCreated(function() {
    const self = this
    self.formErrors = new ReactiveDict()
    self.loadingMsg = new ReactiveVar()
    self.getBalances = (asset) => {
      // console.log(asset);
      
      const symbol = asset || FlowRouter.getParam("asset")
      const assets = UserAccount.findOne().assets
      return assets && assets.length > 0 ? assets.find(e => e.symbol === symbol) : null
    }
  });
  Template.walletSend.helpers({
    userAssets: function () {
      return assets = UserAccount.findOne().assets
    },
    balances () {
      return Template.instance().getBalances()
      // const symbol = FlowRouter.getParam("asset")
      // const assets = UserAccount.findOne().assets
      // return assets && assets.length > 0 ? assets.find(e => e.symbol === symbol) : null
    },
    asset () {
      const symbol = FlowRouter.getParam("asset")
      return TokenData.findOne({symbol: symbol})
    },
    shortSymbol (symbol) {
      if (symbol) {
        return symbol.split("-")[0].substr(0,4)
      }
    },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    recipientError () { return Template.instance().formErrors.get('recipient') },
    amountError () { return Template.instance().formErrors.get('amount') },
    assetError () { return Template.instance().formErrors.get('asset') },
    passwordError () { return Template.instance().formErrors.get('password') },
  });
  Template.walletSend.events({
    "keyup #send-transaction-form input": function (event, self) {
      const name = event.currentTarget.name
      self.formErrors.set(name,'')
    },
    "submit #send-transaction-form": async function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      const from = UserAccount.findOne().address
      const param = FlowRouter.getParam('asset')
      const asset = param || t.asset && t.asset.value

      // Schema based validation
      const validationContext = Schemas.formTransferTx.namedContext('transfer');
      // TODO: Add max amount to pre-check insufficient funds
      const balances = self.getBalances(asset)
      
      const obj = validationContext.clean({
        maxAmount: balances && balances.free || 0,
        sender: from,
        recipient: t.recipient.value,
        amount: t.amount.value,
        asset: asset,
        password: t.password.value
      });
      
      validationContext.validate(obj);
      const sleep = m => new Promise(r => setTimeout(r, m))

      if (validationContext.isValid()) {
        self.loadingMsg.set("preparing tx...")
        await sleep(200)
        let account
        try {
          let keystore = window.localStorage.getItem("binance")
          // NOTE: This will throw password errors
          // we have to delay this...
          
          account = await WALLET.generateAccountFromKeystore(obj.password, keystore)
          
          
          // TODO: replace with custom raw tx build/sign/send
          await BNB.bnbClient.setPrivateKey(account.privateKey, true)
          
          delete obj.password
          keystore = null // SECURITY: unsetting
          self.loadingMsg.set("sending tx...")
          
          BNB.transfer(from, obj.recipient, obj.amount, obj.asset).then((e) => {
            console.log("tx success!!!");
            
            BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")
            // go to view of the asset
            // FlowRouter.go('walletAssetDetails',{symbol: obj.asset})
            history.back()
          }).catch((e) => {
            BNB.bnbClient.setPrivateKey("37f71205b211f4fd9eaa4f6976fa4330d0acaded32f3e0f65640b4732468c377")
            console.log(e.message);
            self.loadingMsg.set(null)
            
            // const msg = e.message
            if (e.message.includes("insufficient fund")) {
              if (e.message.includes("fee needed")) {
                // get the amount.
                const res = e.message.split("but")[1].trim().split(" ")[0]
                // const res2 = res.split(" ")
                const amount = res.substring(0, res.length - 3)
                const num = parseInt(amount)
                const fee = BNB.calculateFee(num)
                
                self.formErrors.set("amount","Insufficient fee funds: " + fee + " (BNB) required");
              } else {

              }

            } else if (e.message.includes("<")) { // this is how insuficient funds come back
              const res = e.message.split(",").find(f => { return f.includes("<")} )
              console.log(res);
              
              self.formErrors.set("amount","Insufficient funds");
            }

          })
          
        } catch (error) {
            self.loadingMsg.set(null)
          // only thing here is basicallly a pw/keystore error
          // when generating the keystore for the privatekey to sign tx
            if (error.message.includes('wrong password')) {
              self.formErrors.set('password', 'Incorrect password')
            }
        }

        
      } else {
        // Handle the form validation errors 
        self.loadingMsg.set(null)
        self.formErrors.set('recipient', validationContext.keyErrorMessage('recipient'))
        self.formErrors.set('amount', validationContext.keyErrorMessage('amount'))
        self.formErrors.set('asset', validationContext.keyErrorMessage('asset'))
        self.formErrors.set('password', validationContext.keyErrorMessage('password'))
      }
      
    }
  });
}
