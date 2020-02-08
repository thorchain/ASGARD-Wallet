if (Meteor.isClient) {
  
  Template.walletImport.onCreated(function name(params) {
    const self = this;
    self.isMnemonic = new ReactiveVar(false);
		self.isLoading = new ReactiveVar(false)
    self.loadingMsg = new ReactiveVar("")
    self.formErrors = new ReactiveDict()
    
    self.importMnemonicWallet = async (mnemonic, pw) => {
      WALLET.generateNewWallet(pw, mnemonic).then(async (e) => {
        await WALLET.unlock(pw)
        FlowRouter.go("home")
      })
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
        keystore = self.validateKeystore(contents)
        if (!check && keystore) { 
            WALLET.generateNewWallet(pw, null, keystore).then(async (e) => {
              await WALLET.unlock(pw)
              FlowRouter.go("home")
            }).catch(err => {
              if (err.message.includes('wrong password')) {
                self.formErrors.set('password', 'Incorrect password')
              }
              self.isLoading.set(false)
            })
        }
      };
      // Execute file read
      reader.readAsText(file)
    }

    // Form validation
    self.validateKeystore = (keystore) => {
      // NOTE: This can be moved to Schema if type: File is created
      try {
        keystore = JSON.parse(keystore)
        if (keystore.version && keystore.id) {
          return keystore
        } else {
          self.formErrors.set('keystoreFile','No valid keystore in file')
        }
      } catch (objError) {
        if (objError instanceof SyntaxError) {
          self.formErrors.set('keystoreFile','Syntax error in file')
        } else {
          self.formErrors.set('keystoreFile','Error processing file')
        }
      }

    }

  })

  Template.walletImport.helpers({
    isMnemonic () { return Template.instance().isMnemonic.get() },
    isLoading () { return Template.instance().isLoading.get() },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    pwError () { return Template.instance().formErrors.get('password') },
    repeatPwError () { return Template.instance().formErrors.get('repeatPassword') },
    fileError () { return Template.instance().formErrors.get('keystoreFile') },
    mnemonicError () { return Template.instance().formErrors.get('mnemonic') },
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
      $('#upload-file-button > span').text(file.name)
      $('#upload-file-button').addClass("disabled")
      $("[data-event=fileReset]").removeClass("d-none")
    },
    "click #upload-file-button": function (event, self) {
      event.preventDefault()
      $('#upload-file-input').click()
    },
    "submit #upload-keystore-form": async function (event, self) {
      event.preventDefault()
      const t = event.currentTarget
      
      // NOTE on no schema validation: The problem is passing type "File" to schema. Is not possible at the moment
      // NOTE: we can validate inside the schema method using asyc addvalidationerror()
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
        setTimeout(async () => {
          try {
            await self.importMnemonicWallet(obj.mnemonic, obj.password)
          } catch (err) {
            self.isLoading.set(false)
            console.log(err)
          }
        }, 200);

      }
    }
  });
}