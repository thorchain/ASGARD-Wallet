const bip39 = require('bip39')

if (Meteor.isClient) {
const sdk = BNB.sdk
  
  Template.walletCreate.onCreated(function() {
    const self = this;
    self.wlist = new ReactiveVar(null);
    self.isMnemonic = new ReactiveVar(false);
		self.isLoading = new ReactiveVar(false)
    self.loadingMsg = new ReactiveVar("")
    self.formErrors = new ReactiveDict()

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
            console.log(error)
            throw new Error(error)
          }
          
          account.keystore = await sdk.crypto.generateKeyStore(account.privateKey, pw)

        } else if (mnemonic) {
          // This is not currently used(?)
          try {
            account.keystore = await sdk.crypto.generateKeyStore(account.privateKey, pw)
            account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
          } catch (error) {
            console.log(error);
            throw new Error(error)
          }
        } else {
          account = await BNB.bnbClient.createAccountWithKeystore(pw)
        }
        await self.updateVault(account.keystore)
        await self.updateUserAccount(account)
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
      // This is handled in routes initially.
    });
    
  });

  Template.walletCreate.helpers({
    isImport () { return (FlowRouter.getParam('method') === "import") },
    wordsList () { return Template.instance().getWlistArray() },
    isMnemonic () { return Template.instance().isMnemonic.get() },
    isLoading () { return Template.instance().isLoading.get() },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    pwError () { return Template.instance().formErrors.get('password')},
    repeatPwError () { return Template.instance().formErrors.get('repeatPassword')},
  });

  Template.walletCreate.events({
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "keyup #generate-wallet-form input": function (event, self) {
      const name = event.currentTarget.name
      self.formErrors.set(name,'')
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      const validationContext = Schemas.formNewWallet.namedContext('createWallet');
      const obj = validationContext.clean({
        password: t.password.value,
        repeatPassword: t.repeatPassword.value
      })

      validationContext.validate(obj);

      if (!validationContext.isValid()) {
        self.formErrors.set("password", validationContext.keyErrorMessage('password'))
        self.formErrors.set("repeatPassword", validationContext.keyErrorMessage('repeatPassword'))
      } else {

        self.isLoading.set(true)
        self.loadingMsg.set("generating wallet")
        setTimeout(async () => {
          try {
            await self.generateNewWallet(obj.password);
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
