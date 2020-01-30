
if (Meteor.isClient) {
  Template.walletSend.onCreated(function() {
    const self = this
    // we need to know the fields
    // 1. recipient (address)
    // 2. amount
    // 3. asset
    // 4. sender
    self.formErrors = new ReactiveDict()
    // self.formErrors.set('recipient','')
    // self.formErrors.set('amount','')
    // self.formErrors.set('asset','')
  });
  Template.walletSend.helpers({
    userAssets: function () {
      return assets = UserAccount.findOne().assets
    },
    balances () {
      const symbol = FlowRouter.getParam("asset")
      const assets = UserAccount.findOne().assets
      return assets && assets.length > 0 ? assets.find(e => e.symbol === symbol) : null
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
    recipientError () {
      return Template.instance().formErrors.get('recipient')
    },
    amountError () {
      return Template.instance().formErrors.get('amount')
    },
    assetError () {
      return Template.instance().formErrors.get('asset')
    }
  });
  Template.walletSend.events({
    "keyup #send-transaction-form input": function (event, self) {
      const name = event.currentTarget.name
      self.formErrors.set(name,'')
    },
    "submit #send-transaction-form": function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      const from = UserAccount.findOne().address
      const param = FlowRouter.getParam('asset')
      const asset = param || t.asset && t.asset.value

      // Schema based validation
      const validationContext = Schemas.formTransferTx.namedContext('transfer');
      const obj = validationContext.clean({
        sender: from,
        recipient: t.recipient.value,
        amount: t.amount.value,
        asset: asset
      });
      
      validationContext.validate(obj);
      console.log(validationContext.validationErrors());

      if (validationContext.isValid()) {

        BNB.transfer(from, obj.recipient, obj.amount, obj.asset).then(async (e) => {
          // Update balances
          // gotten from websockets
          console.log("send transfer tx success...")
          console.log(e);
          
          // FlowRouter.go("walletAssets")
          // actually go back
          history.back()
        })
        
      } else {
        self.formErrors.set('recipient', validationContext.keyErrorMessage('recipient'))
        self.formErrors.set('amount', validationContext.keyErrorMessage('amount'))
        self.formErrors.set('asset', validationContext.keyErrorMessage('asset'))
      }
      
    }
  });
}
