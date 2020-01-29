const bip39 = require('bip39')

if (Meteor.isClient) {
const sdk = BNB.sdk
  
  Template.walletCreate.onCreated(function() {
    var self = this;
    self.wlist = new ReactiveVar(null);
    self.isMnemonic = new ReactiveVar(false);
		self.isLoading = new ReactiveVar(false)
    self.loadingMsg = new ReactiveVar("")
    self.formPWHelpMsg1 = new ReactiveVar(false)
    self.formPWHelpMsg2 = new ReactiveVar(false)

    self.setWlist = () => {
      const wlist = self.wlist.get();
      if (!wlist) {
        mnemonic = bip39.generateMnemonic();
        self.wlist.set(mnemonic);
      }
    }

    self.getWlistArray = () => {
      const mnemonic = self.wlist.get();
      return mnemonic.length ? mnemonic.split(" ") : [] ;
    }

    self.generateNewWallet = async (pw, mnemonic) => {
      const vault = window.localStorage.getItem("binance");
      if (vault) {
        throw new Error("Wallet vault already exists")
      } else {
        let account
        if (self.isMnemonic.get()) {
          const words = self.wlist.get();
          try {
            account = await BNB.bnbClient.recoverAccountFromMnemonic(words)
          } catch (error) {
            console.log("here is the error");
            console.log(error);
            
          }
          
          account.keystore = await sdk.crypto.generateKeyStore(account.privateKey, pw)
        } else if (mnemonic) {
          // NOTE: This no longer works...?
        } else {
          try {
            console.log("we got the password error?");
            account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
          } catch (error) {
            console.log(error);
            
          }
          account = await BNB.bnbClient.createAccountWithKeystore(pw)
        }

        console.log(account);
        await self.updateVault(account.keystore)
        // await WALLET.updateVault(account.keystore);
        await self.updateUserAccount(account)
        // await WALLET.initializeUserAccount(account);
      }

    }

    self.updateUserAccount = async (account) => {
			self.loadingMsg.set("getting data")
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
        // TODO: Probably we want to update transactions?
      }
    }

    self.updateVault = (keystore) => {
      window.localStorage.setItem("binance", JSON.stringify(keystore));
    }

    self.setWlist()
    self.autorun(function() {
      // if there is a user here we need to redirect
    });
    
  });

  Template.walletCreate.helpers({
    isImport () { return (FlowRouter.getParam('method') === "import") },
    wordsList () { return Template.instance().getWlistArray() },
    isMnemonic () { return Template.instance().isMnemonic.get() },
    isLoading () { return Template.instance().isLoading.get() },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    formPWHelpMsg () {
      const obj = {
        first: {
          text: Template.instance().formPWHelpMsg1.get(),
          color: "warning"
        },
        second: {
          text: Template.instance().formPWHelpMsg2.get(),
          color: "warning"
        }
      }
      return obj
    }
  });

  Template.walletCreate.events({
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "blur #generate-wallet-form input": function (event, self) {
      self.formPWHelpMsg1.set(false)
      self.formPWHelpMsg2.set(false)
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      if (!t.password.value) {
        // no password, set msg1
        self.formPWHelpMsg1.set("Please enter password")
      } else if (t.password.value !== t.repeatPassword.value) {
        // password mismatch, set msg2
        self.formPWHelpMsg2.set("Passwords do not match")
      } else {

        self.isLoading.set(true)
        self.loadingMsg.set("generating wallet")
        setTimeout(async () => {
          try {
            await self.generateNewWallet(event.currentTarget.password.value);
            FlowRouter.go("home")
          } catch (err) {
            self.isLoading.set(false)
            console.log(err)
          }
        }, 500);

      }
    },
  });

}
