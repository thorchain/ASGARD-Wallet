if (Meteor.isClient) {
  
  Template.walletImport.onCreated(function name(params) {
    const self = this;
    self.isMnemonic = new ReactiveVar(false);
		self.isLoading = new ReactiveVar(false)
    self.loadingMsg = new ReactiveVar("")
    self.formErrors = new ReactiveDict()
    
    self.importMnemonicWallet = async (mnemonic, pw) => {
      const vault = window.localStorage.getItem("binance");
      if (vault) {
        throw new Error("wallet vault already exists")
      } else {
        let account
        if (self.isMnemonic.get()) { // just confirmation...
          account = await BNB.bnbClient.recoverAccountFromMnemonic(mnemonic)
          account.keystore = await BNB.sdk.crypto.generateKeyStore(account.privateKey, pw)
        } // else error

        await self.updateVault(account.keystore)
        await self.updateUserAccount(account)

      }
    }

    self.importWalletFile = (file, pw, check) => {
      const reader = new FileReader();
      let keystore
      reader.onerror = (event) => {
        self.formErrors.set("keystoreFile", event.target.error.code)
        throw new Error("File could not be read! Code " + event.target.error.code);
      };
      reader.onload = async (event) => {
        const contents = event.target.result;
        try {
          keystore = self.validateKeystore(contents)
          // how do we return a truthy value?
          // to change the ui...
        } catch (error) {
          self.formErrors.set(error.key, error.message)
        }
        // include in try... ?
        if (!check && keystore) { self.processKeystore(keystore, pw) }
      };
      // Execute file read
      reader.readAsText(file)
    }

    self.validateKeystore = (keystore) => {
      try {
        keystore = JSON.parse(keystore)
        if (keystore.version && keystore.id) {
          return keystore
        } else {
          throw ({key:"keystoreFile", message: "No valid keystore in file"})
        }
      } catch (objError) {
        if (objError instanceof SyntaxError) {
          throw ({key:"keystoreFile", message: "Error processing file"})
        } else {
          throw ({key:"keystoreFile", message: "Error processing file"})
        }
      }

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
            self.formErrors.set("password","Incorrect password");
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
    pwError () {
      return Template.instance().formErrors.get('password')
    },
    repeatPwError () {
      return Template.instance().formErrors.get('repeatPassword')
    },
    fileError () {
      return Template.instance().formErrors.get('keystoreFile')
    },
    mnemonicError () {
      return Template.instance().formErrors.get('mnemonic')
    },
  });

  Template.walletImport.events({
    "click [data-event='fileReset']": function (event, self) {
      event.stopPropagation()
      self.formErrors.set('keystoreFile','')
      // clear the file value
      $("#upload-file-input").val("")
      $('#upload-file-button > span').text("Select File")
      $('#upload-file-button').removeClass("disabled")
      $("[data-event=fileReset").addClass("d-none")
    },
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      self.formErrors.set('password','')
      self.formErrors.set('repeatPassword','') // not working?
      self.formErrors.set('keystoreFile','')
      self.formErrors.set('mnemonic','')
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "keyup #upload-keystore-form input, keyup #import-mnemonic-form input": function (event, self) {
      const name = event.currentTarget.name
      self.formErrors.set(name,'')
    },
    "change #upload-file-input": async function (event, self) {
      const file = event.currentTarget.files[0]
      self.formErrors.set('keystoreFile','')
      self.importWalletFile(file, null, true)

      // above happens too late...
      // if (self.formErrors.get('keystoreFile').length === 0) {
        $('#upload-file-button > span').text(file.name)
        $('#upload-file-button').addClass("disabled")
        $("[data-event=fileReset]").removeClass("d-none")
      // } else {
        // clear it
        // $("#upload-file-input").val("")
      // }

    },
    "click #upload-file-button": function (event, self) {
      event.preventDefault()
      $('#upload-file-input').click()
    },
    "submit #upload-keystore-form": async function (event, self) {
      event.preventDefault()
      const t = event.currentTarget
      
      // NOTE on no schema validation: The problem is passing type "File" to schema. Is not possible at the moment
      // NOTE: Based on async filereader, we validate inside the method using asyc addvalidationerror()
      if (t.keystoreFile.files.length === 0) { self.formErrors.set("keystoreFile", "Please select a file") }
      if (t.password.value.length === 0) { self.formErrors.set("password", "Password required") }

      if (
        t.password.value &&
        t.keystoreFile.files.length > 0 &&
        self.formErrors.get('keystoreFile').length === 0
        ) {
        const file = t.keystoreFile.files[0];
        const pw = t.password.value;
        self.isLoading.set(true)
        self.loadingMsg.set("processing file")
        // Delay to allow for UI render DOM update before CPU takes over keystore processing
        // TODO: refactor this
        setTimeout(async () => {
          try {
            await self.importWalletFile(file, pw)
          } catch (err) {
            self.isLoading.set(false)
            console.log(err)
          }
        }, 100);

      } 
    },
    "submit #import-mnemonic-form": async function (event, self) {
      event.preventDefault()
      const t = event.currentTarget
      const validationContext = Schemas.formImportWalletMnemonic.namedContext('importMnemonic');
      const obj = validationContext.clean({
        mnemonic: t.mnemonic.value,
        password: t.password.value,
        repeatPassword: t.repeatPassword.value
      })

      validationContext.validate(obj);

      if (!validationContext.isValid()) {
        self.formErrors.set("mnemonic", validationContext.keyErrorMessage('mnemonic'))
        self.formErrors.set("password", validationContext.keyErrorMessage('password'))
        self.formErrors.set("repeatPassword", validationContext.keyErrorMessage('repeatPassword'))
      } else {

        self.isLoading.set(true)
        self.loadingMsg.set("generating wallet")
        // const words = obj.mnemonic
        // const pw = obj.password

        setTimeout(async () => {
          try {
            await self.importMnemonicWallet(obj.mnemonic, obj.password)
            FlowRouter.go("home")
          } catch (err) {
            self.isLoading.set(false)
            console.log(err)
          }
        }, 100);

      }
    }
  });
}