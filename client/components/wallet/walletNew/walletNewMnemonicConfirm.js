if (Meteor.isClient) {
  Template.walletNewMnemonicConfirm.onCreated(function() {
    const self = this
    self.wlist = new ReactiveVar(Session.get('seedphrase'))
    self.shuffledWordsList = new ReactiveVar()
    self.confwlist = new ReactiveVar()
    self.phraseErrors = new ReactiveDict()
    self.loadingMsg = new ReactiveVar("")
    self.formErrors = new ReactiveDict()

    self.setShuffleWordsArray = () => {
      console.log("setting shuffled words");
      
      const shuffledArr = arr => {
        const newArr = arr.slice()
        for (let i = newArr.length - 1; i > 0; i--) {
          const rand = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
        }
        return newArr
      };

      // get the data somehow
      const thearr = self.getWordListArray()
      const shuffled = shuffledArr(thearr)
      self.shuffledWordsList.set(shuffled.join(" "))
    }
    
    // where do we get this from?
    self.getWordListArray = () => {
      const words = self.wlist.get();
      return words && words.length > 0 ? words.split(" ") : [] ;
    }
    self.getShuffleWordListArray = () => {
      const words = self.shuffledWordsList.get()
      return words && words.length > 0 ? words.split(" ") : [] ;
    }
    self.getConfirmListArray = () => {
      const words = self.confwlist.get();
      return words && words.length > 0 ? words.split(" ") : [] ;
    }

    self.generateNewWallet = (pw, mnemonic) => {
      WALLET.generateNewWallet(pw, mnemonic).then(async (e) => {
        await WALLET.unlock(pw)
        FlowRouter.go('home')
      })
    }
    self.checkPhraseConfirmWords = () => {
      console.log("checking phrase");
      
      // check against original phrase
      // just loop for length
      const words = self.getWordListArray()
      const confWords = self.getConfirmListArray()
      if (words.length === confWords.length) {
        // const errs = []
        let isErr = false
        for (let i = 0; i < words.length; i++) {
          const word = words[i]
          const confWord = confWords[i]
          if (word !== confWords) {
            self.phraseErrors.set(confWord, 'danger')
            isErr = true
          }
        }
        return !isErr
        
      } else {
        // some error
        self.formErrors.set('mnemonic','Complete confirmation')
        return false
      }

    }
    // self.wlist.set(Session.get('wlist'))
    // self.init()
    self.setShuffleWordsArray()
    self.init = () => {
      // const shuffleWords = self.getShuffleWordsArray()
      // self.shuffledList.set(ShuffleWords.join(" "))
    }
    
    self.autorun(function() {
      console.log("why freezing");
    })
  })

  Template.walletNewMnemonicConfirm.helpers({
    wordslist () {
      const words = Template.instance().getShuffleWordListArray()
      // const words = Template.instance().getWordListArray()
      const confWords = Template.instance().getConfirmListArray()
      // need to blank out choosen ones
      // const newWords = words.concat(confWords)

      return words.map(e => {
        const disabled = confWords.find(f => {
          return f === e;
        });
        return {text:e, style: disabled ? "disabled" : ""}
      })
    },
    confirmWordsList () {
      const t = Template.instance()
      const confWords = t.getConfirmListArray()
      // add errors
      return confWords.map(e => {
        const err = t.phraseErrors.get(e)
        return {text: e, error: err}
      })

    },
    // isMnemonic () { return Template.instance().isMnemonic.get() },
    // isLoading () { return Template.instance().isLoading.get() },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    phraseError () { return Template.instance().formErrors.get('mnemonic')},
    pwError () { return Template.instance().formErrors.get('password')},
    repeatPwError () { return Template.instance().formErrors.get('repeatPassword')},
  })
  Template.walletNewMnemonicConfirm.events({
    "click [data-event='resetPhrase']": function (event, self) {
      event.preventDefault()
      self.confwlist.set(null)// we need to clear all errors
      self.phraseErrors.clear()
    },
    "click [data-event='addConfirmWord']": function (event, self) {
      event.preventDefault()
      const theword = event.currentTarget.dataset.param
      let confWords = self.getConfirmListArray()
      // PREVENT DUPLICATES
      // TODO: Improve with regex or other ()
      const exists = confWords.find(e => { return e === theword})
      if (!exists) {
        const newConfWords = confWords.length > 0 ? confWords.join(" ").concat(" " + theword) : theword;
        self.confwlist.set(newConfWords)
        self.formErrors.set('mnemonic', null)
      }
    },
    "click [data-event='removeConfirmWord']": function (event, self) {
      event.preventDefault()
      console.log("wtf no removing?");
      
      const theword = event.currentTarget.dataset.param
      console.log(theword);
      
      let confWords = self.getConfirmListArray()
      let removed
      // why does this fail for words not at the end...
      console.log(confWords);
      for (let i = 0; i < confWords.length; i++) {
        const e = confWords[i];
        if (e === theword) {
         removed = confWords.splice(i, 1)
        }
      }
      self.phraseErrors.set(removed[0], null)
      self.formErrors.set('mnemonic', null)

    //   for( var i = 0; i < arr.length; i++){ 
    //     if ( arr[i] === 5) {
    //       arr.splice(i, 1); 
    //     }
    //  }
      
      // const newConfWords = confWords.filter(e => {
      //   return e !== theword
      // })

      // console.log(newConfWords);

      self.confwlist.set(confWords.join(" "))
    },
    "keyup #generate-wallet-form input": function (event, self) {
      const name = event.currentTarget.name
      self.formErrors.set(name,'')
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      const validationContext = Schemas.formNewMnemonicWallet.namedContext('createMnemonicWallet');
      const obj = validationContext.clean({
        phrase: self.wlist.get(),
        repeatPhrase: self.confwlist.get(),
        password: t.password.value,
        repeatPassword: t.repeatPassword.value
      })

      validationContext.validate(obj);
      const wordscheck = self.checkPhraseConfirmWords()

      if (!validationContext.isValid() || !wordscheck) {
        if (!wordscheck) {
          self.formErrors.set("mnemonic", "Incorrect phrase")
        } else {
          self.formErrors.set("mnemonic", validationContext.keyErrorMessage('repeatPhrase'))
        }
        self.formErrors.set("password", validationContext.keyErrorMessage('password'))
        self.formErrors.set("repeatPassword", validationContext.keyErrorMessage('repeatPassword'))
      } else {

        self.loadingMsg.set("generating wallet")
        setTimeout(async () => {
          try {
            const words = self.wlist.get();
            await self.generateNewWallet(obj.password, words);
            // console.log("go to home route");
            // FlowRouter.go("home")
          } catch (err) {
            self.loadingMsg.set(false)
            console.log(err)
          }
        }, 200);

      }
    },
  })
}
