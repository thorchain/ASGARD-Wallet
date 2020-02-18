if (Meteor.isClient) {
  Template.walletNewMnemonicConfirm.onCreated(function() {
    const self = this
    self.wlist = new ReactiveVar(Session.get('seedphrase'))
    self.confwlist = new ReactiveVar()
    self.phraseErrors = new ReactiveDict()
    self.loadingMsg = new ReactiveVar("")
    self.formErrors = new ReactiveDict()

    self.init = () => {

      const getShuffledArr = arr => {
        const newArr = arr.slice()
        for (let i = newArr.length - 1; i > 0; i--) {
          const rand = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
        }
        return newArr
      };

      // get the data somehow
      const thearr = self.getWordListArray()
      const newarr = getShuffledArr(thearr)
      self.wlist.set(newarr.join(" "))

      
    }
    
    // where do we get this from?
    self.getWordListArray = () => {
      
      const mnemonic = self.wlist.get();
      
      return mnemonic && mnemonic.length > 0 ? mnemonic.split(" ") : [] ;
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
    self.checkPhraseConfirm = () => {
      
      // check the two lists
      //
    }
    // self.wlist.set(Session.get('wlist'))
    self.init()
    
    self.autorun(function() {
      console.log("why freezing");
    })
  })

  Template.walletNewMnemonicConfirm.helpers({
    wordslist () {
      const words = Template.instance().getWordListArray()
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
      return Template.instance().getConfirmListArray()
    }
  })
  Template.walletNewMnemonicConfirm.events({
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
      }
    },
    "click [data-event='removeConfirmWord']": function (event, self) {
      event.preventDefault()
      const theword = event.currentTarget.dataset.param
      let confWords = self.getConfirmListArray()
      const newConfWords = confWords.filter(e => {
        return e !== theword
      })
      self.confwlist.set(newConfWords.join(" "))
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
