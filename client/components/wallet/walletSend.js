
if (Meteor.isClient) {
  Template.walletSend.onCreated(function() {
    const self = this
    self.formErrors = new ReactiveDict()
    self.getBalances = () => {
      const symbol = FlowRouter.getParam("asset")
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
      // TODO: Add password when vault is closed
      // TODO: Add max amount to pre-check insufficient funds
      // const balances = self.getBalances()
      const obj = validationContext.clean({
        // maxAmount: balances.free
        sender: from,
        recipient: t.recipient.value,
        amount: t.amount.value,
        asset: asset
      });
      
      validationContext.validate(obj);
      console.log(validationContext.validationErrors());
      // const url = "http://google.com"
      // require('electron').shell.openExternal(url);

      if (validationContext.isValid()) {
        try {
          // TODO: Add decrypt valut here when upgrading useraccount to persistent
          BNB.transfer(from, obj.recipient, obj.amount, obj.asset).then(async (e) => {
            // FlowRouter.go("walletAssets")
            history.back()
          }).catch((e) => {
            console.log('there was a tx error.... promis catch');
            console.log(e.message);
            
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
          
        }

        
      } else {
        self.formErrors.set('recipient', validationContext.keyErrorMessage('recipient'))
        self.formErrors.set('amount', validationContext.keyErrorMessage('amount'))
        self.formErrors.set('asset', validationContext.keyErrorMessage('asset'))
      }
      
    }
  });
}
