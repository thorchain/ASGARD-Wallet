const bip39 = require('bip39')

if (Meteor.isClient) {
const sdk = BNB.sdk
  
  Template.walletCreate.onCreated(function() {
    var self = this;
    self.wlist = new ReactiveVar(null);
    self.isMnemonic = new ReactiveVar(false);
		self.isLoading = new ReactiveVar(false)
		self.loadingMsg = new ReactiveVar("")

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
          account = await BNB.bnbClient.recoverAccountFromMnemonic(words)
          account.keystore = await sdk.crypto.generateKeyStore(account.privateKey, pw)
        } else if (mnemonic) {
          // NOTE: This no longer works...?
          account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
        } else {
          account = await BNB.bnbClient.createAccountWithKeystore(pw)
        }
        await self.updateVault(account.keystore)
        await self.updateUserAccount(account)
      }

    }

    self.importMnemonicWallet = async (mnemonic, pw) => {
      const vault = window.localStorage.getItem("binance");
      if (vault) {
        throw new Error("wallet vault already exists")
      } else {
        let account
        if (self.isMnemonic.get()) { // just confirmation...
          account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
          account.keystore = await sdk.crypto.generateKeyStore(account.privateKey, pw)
        } // else error

        await self.updateVault(account.keystore)
        await self.updateUserAccount(account)

      }
    }

    self.importWalletFile = async (file, pw) => {
      const reader = new FileReader();
      reader.onerror = (event) => { throw new Error("File could not be read! Code " + event.target.error.code); };
      reader.onload = async (event) => {
        console.log("executing reading file...");
        var contents = event.target.result;
        const keystore = JSON.parse(contents)
        if (keystore && keystore.version) {
          const account = await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
          account.keystore = keystore
          await self.updateVault(keystore)
          await self.updateUserAccount(account)
        }
        FlowRouter.go('home') // TODO: Place in proper async chain
      };
      
      // Execute file read
      reader.readAsText(file)
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
        // Probably we want to update transactions?
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
    loadingMsg () { return Template.instance().loadingMsg.get() }
  });

  Template.walletCreate.events({
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
			self.isLoading.set(true)
			self.loadingMsg.set("generating wallet")
			setTimeout(async () => {
				try {
          if (!event.currentTarget.password.value) throw "no password"
        await self.generateNewWallet(event.currentTarget.password.value);
					FlowRouter.go("home")
				} catch (err) {
					self.isLoading.set(false)
					console.log(err)
				}
			}, 500);
    },
    "change #upload-file-input": function (event, self) {
      const file = event.currentTarget.files[0]
      // change button text, and make disabled
      $('#upload-file-button').attr({value: file.name, disabled: true})
    },
    "click #upload-file-button": function (event, self) {
      event.preventDefault()
      console.log("Triggering file upload");
      $('#upload-file-input').click()
    },
    "submit #upload-keystore-form": async function (event, self) {
      event.preventDefault()
			self.isLoading.set(true)
			self.loadingMsg.set("generating wallet")
      const t = event.currentTarget
      const file = t.keystoreFile.files[0];
      const pw = t.password.value;
			setTimeout(async () => {
        console.log("trying to import the wallet");
        
				try {
          if (!event.currentTarget.password.value) throw "no password"
          await self.importWalletFile(file, pw)
					// FlowRouter.go("home") // this is done above in file execute cb
				} catch (err) {
					self.isLoading.set(false)
					console.log(err)
				}
			}, 500);
    },
    "submit #import-mnemonic-form": async function (event, self) {
      event.preventDefault()
			self.isLoading.set(true)
			self.loadingMsg.set("generating wallet")
      const words = event.currentTarget.mnemonic.value
      const pw = event.currentTarget.password.value

			setTimeout(async () => {
				try {
          if (!event.currentTarget.password.value) throw "no password"
          await self.importMnemonicWallet(words, pw)
					FlowRouter.go("home")
				} catch (err) {
					self.isLoading.set(false)
					console.log(err)
				}
			}, 500);
    }
  });

}
