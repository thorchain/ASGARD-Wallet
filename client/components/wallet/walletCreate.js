const bip39 = require('bip39')

if (Meteor.isClient) {
const sdk = BNB.sdk
  
  Template.walletCreate.onCreated(function() {
    var self = this;
    self.wlist = new ReactiveVar(null);
    self.isMnemonic = new ReactiveVar(false);

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

    self.generateNewWallet = async function (pw, mnemonic) {
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
        self.updateVault(account.keystore)
        self.updateUserAccount(account)
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

        self.updateVault(account.keystore)
        self.updateUserAccount(account)

      }
    }

    self.importWalletFile = async (file, pw) => {
      const reader = new FileReader();
      reader.onerror = (event) => { throw new Error("File could not be read! Code " + event.target.error.code); };
      reader.onload = async (event) => {
        var contents = event.target.result;
        const keystore = JSON.parse(contents)
        if (keystore && keystore.version) {
          const account = await BNB.bnbClient.recoverAccountFromKeystore(keystore, pw)
          console.log("got result from binance client");
          
          account.keystore = keystore
          self.updateVault(keystore)
          self.updateUserAccount(account)
        }
        FlowRouter.go('home')
      };
      
      // Execute file read
      console.log("executing reading file...");
      
      await reader.readAsText(file)
    }
    self.updateUserAccountX = async (account) => {
      console.log("setting Binance client");
      await BNB.setPrivateKey(account.privateKey)
      console.log("good to go?");
      
      const doc = UserAccount.findOne();
      const select = doc && doc._id ? {_id: doc._id} : {};
      UserAccount.update(select, account, {upsert: true})
    }
    self.updateUserAccount = async (account) => {
      console.log("updating account");
      BNB.setPrivateKey(account.privateKey)
			const doc = UserAccount.findOne();
			const select = doc && doc._id ? {_id: doc._id} : {};
			// This inits the binance client as well
			UserAccount.update(select, account, {upsert: true})
			await BNB.binanceTokens().then(e => {
				TokenData.batchInsert(e.data)
			})
			await BNB.bnbClient.getTransactions(account.address).then(e => {
				UserTransactions.batchInsert(e.result.tx)
			})
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
    isImport: function () {
      const method = FlowRouter.getParam('method')
      return (method === "import")
    },
    wordsList: function () {
      return Template.instance().getWlistArray();
    },
    isMnemonic: function () {
      return Template.instance().isMnemonic.get();
    }
    
  });

  Template.walletCreate.events({
    "click [data-event='toggleMnemonic']": function (event, self) {
      event.preventDefault();
      self.isMnemonic.set(!self.isMnemonic.get())
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      try {
        if (!event.currentTarget.password.value) throw "no password"
        await self.generateNewWallet(event.currentTarget.password.value);
        FlowRouter.go('home')
      } catch (err) {
        console.error(err);
      }
    },
    "change #upload-file-input": function (event, self) {
      // TODO: rework below for ui updating
      // event.preventDefault()
      const file = event.currentTarget.files[0]
      console.log(file);
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
      const t = event.currentTarget
      const file = t.keystoreFile.files[0];
      const pw = t.password.value;
      try {
        if (!event.currentTarget.password.value) throw "no password"
        await self.importWalletFile(file, pw)
        // FlowRouter.go('home')
      } catch (err) {
        console.error(err)
      }
    },
    "submit #import-mnemonic-form": async function (event, self) {
      event.preventDefault()
      // TODO: Temporary validation of mnemonic
      const words = event.currentTarget.mnemonic.value
      const pw = event.currentTarget.password.value
      try {
        if (!event.currentTarget.password.value) throw "no password"
        await self.importMnemonicWallet(words, pw)
        FlowRouter.go('home')
      } catch (err) {
        console.error(err)
      }
    }
  });

}
