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
      let mnemonic
      if (!Session.get('seedphrase')) {
        mnemonic = bip39.generateMnemonic();
        self.wlist.set(mnemonic);
        Session.set('seedphrase', mnemonic);
      } else {
        mnemonic = Session.get('seedphrase')
        self.wlist.set(mnemonic);
      }
    }

    self.getWlistArray = () => {
      const mnemonic = self.wlist.get();
      return mnemonic.length ? mnemonic.split(" ") : [] ;
    }

    self.generateNewWallet = (pw, mnemonic) => {
      WALLET.generateNewWallet(pw, mnemonic).then(async (e) => {
        await WALLET.unlock(pw)
        // This compponent only handles keystore now
        // redirect to account
        FlowRouter.go('walletAccounts')
      })
    }

    // Listen to trigger UI updates
    WALLET.on('walletGenerated', function () {
      self.loadingMsg.set("Setting up account")
    })

    self.setWlist()
    self.autorun(function() {
      const type = FlowRouter.getParam('type')
      if (type && type === 'mnemonic') {
        self.isMnemonic.set(true)
      } else {
        self.isMnemonic.set(false)
      }
      // Added(necessary security?) if there is an existing
      // user here we need to redirect
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
      if (!$(event.currentTarget).hasClass('active')) {
        self.formErrors.set('password','')
        self.formErrors.set('repeatPassword','') // not working?
        self.isMnemonic.set(!self.isMnemonic.get())
      }
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
            // TODO: Refactor if necessary after proper promise handling in method
            // we need to send words if necessary here...
            const words = self.isMnemonic.get() ? self.wlist.get() : null;
            await self.generateNewWallet(obj.password, words);
            // console.log("go to home route");
            // FlowRouter.go("home")
          } catch (err) {
            self.isLoading.set(false)
            console.log(err)
          }
        }, 200);

      }
    },
  });

}
