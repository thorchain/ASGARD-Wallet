if (Meteor.isClient) {
  
  Template.walletImport.onCreated(function name(params) {
    const self = this;
    self.isMnemonic = new ReactiveVar(false);
		self.isLoading = new ReactiveVar(false)
    self.loadingMsg = new ReactiveVar("")
    self.formPWHelpMsg = new ReactiveVar(false)
    self.formMnemonicHelpMsg = new ReactiveVar(false)
    self.formKeyfileHelpMsg = new ReactiveVar(false)
    
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
      let keystore
      reader.onerror = (event) => { throw new Error("File could not be read! Code " + event.target.error.code); };
      reader.onload = async (event) => {
        console.log("executing reading file...");
        var contents = event.target.result;
        keystore = JSON.parse(contents)
        self.processKeystore(keystore, pw)
      };
      
      // Execute file read
      return reader.readAsText(file)
    }

    self.processKeystore = async (keystore, pw) => {
      console.log(keystore)
      if (keystore && keystore.version) {
        let account
        try {
          account = await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
          account.keystore = keystore
        } catch (error) {
          console.log("lookin gor  the password error");
          console.log(error.message);
          self.isLoading.set(false)
          if (error.message.includes("password")) {
            self.formPWHelpMsg.set("incorrect password");
          }
          throw error
        }
        await self.updateVault(keystore)
        await self.updateUserAccount(account)
        FlowRouter.go('home') // TODO: Place in proper async chain
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
        // Probably we want to update transactions?
      }
    }
    self.updateVault = (keystore) => {
      window.localStorage.setItem("binance", JSON.stringify(keystore));
    }


    self.autorun(function (params) {
      
    })
  })

  Template.walletImport.helpers({
    isMnemonic () { return Template.instance().isMnemonic.get() },
    isLoading () { return Template.instance().isLoading.get() },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    formPWHelpMsg () {
      const obj = {
        text: Template.instance().formPWHelpMsg.get(),
        color: "warning"
      }
      return obj
    },
    formMnemonicHelpMsg () {
      const obj = {
        text: Template.instance().formMnemonicHelpMsg.get(),
        color: "warning"
      }
      return obj
    },
    formFileHelpMsg () {
      const obj = {
        text: Template.instance().formKeyfileHelpMsg.get(),
        color: "warning"
      }
      return obj
    }
  });

  Template.walletImport.events({
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      // self.formMnemonicHelpMsg.set(false)
      // self.formPWHelpMsg.set(false)
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "blur #import-mnemonic-form input": function (event, self) {
      self.formPWHelpMsg.set(false)
      self.formMnemonicHelpMsg.set(false)
    },
    "change #upload-file-input": function (event, self) {
      const file = event.currentTarget.files[0]
      self.formKeyfileHelpMsg.set(false)
      // change button text, and make disabled
      $('#upload-file-button').attr({value: file.name, disabled: true})
    },
    "click #upload-file-button": function (event, self) {
      event.preventDefault()
      $('#upload-file-input').click()
    },
    "submit #upload-keystore-form": async function (event, self) {
      event.preventDefault()
      const t = event.currentTarget
      
      console.log(t.keystoreFile.files);
      
      if (t.keystoreFile.files.length === 0) {
        console.log("wtf");
        // no password, set msg1
        self.formKeyfileHelpMsg.set("Please select a file")
      } else if (!t.password.value) {
        // password mismatch, set msg2
        self.formPWHelpMsg.set("Please enter password")
      } else {

        self.isLoading.set(true)
        self.loadingMsg.set("generating wallet")
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
            console.log("got the error in the event handlers now");
            
            console.log(err)
          }
        }, 500);
      }
    },
    "submit #import-mnemonic-form": async function (event, self) {
      event.preventDefault()
      // do the basic checks!
      const t = event.currentTarget
      if (!t.mnemonic.value) {
        // no password, set msg1
        self.formMnemonicHelpMsg.set("Please enter phrase")
      } else if (!t.password.value) {
        // password mismatch, set msg2
        self.formPWHelpMsg.set("Please enter password")
      } else {
        // check the mnemonic is valid
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
    }
  });
}