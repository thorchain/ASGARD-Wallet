// import { v4 as uuidv4 } from 'uuid';

if (Meteor.isClient) {
  Template.walletNewMnemonicConfirm.onCreated(function() {
    const self = this
    // This is for pure reference, as it is created by Binance lib
    self.wlist = new ReactiveVar(Session.get('seedphrase'))
    // we have to create a dict with id's to prevent duplicates problem
    // So we just use a collection, with additional flexibility
    self.wlistColl = new Mongo.Collection(null)
    self.wlistDict = new ReactiveDict()
    // self.shuffledWordsList = new ReactiveVar()
    // self.shuffledIDsList = new ReactiveVar()
    self.confwlist = new ReactiveVar()
    self.phraseErrors = new ReactiveDict()
    self.loadingMsg = new ReactiveVar("")
    self.formErrors = new ReactiveDict()

    // self.setShuffleWordsArray = () => {
    //   console.log("setting shuffled words");
      
    //   const shuffledArr = arr => {
    //     const newArr = arr.slice()
    //     for (let i = newArr.length - 1; i > 0; i--) {
    //       const rand = Math.floor(Math.random() * (i + 1));
    //       [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
    //     }
    //     return newArr
    //   };

    //   // get the data somehow
    //   const thearr = self.getWordListArray()
    //   const shuffled = shuffledArr(thearr)
    //   self.shuffledWordsList.set(shuffled.join(" "))
    // }
    self.getShuffledWords = () => {
      
      const shuffledArr = arr => {
        const newArr = arr.slice()
        for (let i = newArr.length - 1; i > 0; i--) {
          const rand = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
        }
        return newArr
      };

      // get the data somehow
      const thearr = self.wlistColl.find().fetch()
      return shuffledArr(thearr)
      // self.shuffledWordsList.set(shuffled.join(" "))
    }
    
    // where do we get this from?
    // self.getWordListArray = () => {
    //   const words = self.wlist.get();
    //   return words && words.length > 0 ? words.split(" ") : [] ;
    // }
    // self.getWordListIDsArray = () => {
    //   return self.wlistColl.find().fetch().map(e => { return e._id})
    // }
    // self.getShuffleWordListArray = () => {
    //   // const words = self.wlistColl.find({_id: {$in: []}})
    //   const words = self.shuffledWordsList.get()
    //   return words && words.length > 0 ? words.split(" ") : [] ;
    // }
    // self.getConfirmListArray = () => {
    //   return self.wlistColl.find({confirmed: true}).fetch()
    //   // const words = self.confwlist.get();
    //   // return words && words.length > 0 ? words.split(" ") : [] ;
    // }

    self.generateNewWallet = (pw, mnemonic) => {
      WALLET.generateNewWallet(pw, mnemonic).then(async (e) => {
        await WALLET.unlock(pw)
        Session.set('seedphrase', null) // SECURITY:
        FlowRouter.go('home')
      })
    }
    self.checkPhraseConfirmWords = () => {
      // check against original phrase
      
      // const words = self.getWordListArray()
      const words = self.wlistColl.find().fetch()
      const confWords = self.wlistColl.find({confirmed:true},{sort: {sequence: 1}}).fetch()
      
      if (words.length === confWords.length) {
        // const errs = []
        let isErr = false
        for (let i = 0; i < words.length; i++) {
          const word = words[i]
          
          const confWord = confWords[i];
          
          if (word._id !== confWord._id) {
            self.phraseErrors.set(confWord.text, 'danger')
            self.wlistColl.update({_id:confWord._id},{$set:{error:"danger"}})
            isErr = true
          }
        }

        return !isErr
        
      } else {
        self.formErrors.set('mnemonic','Complete confirmation')
        return false
      }

    }
    // self.wlist.set(Session.get('wlist'))
    // self.init()
    self.init = () => {
      let words = Session.get('seedphrase') && Session.get('seedphrase').split(" ")
      if (words) {
        words = words.map(e => {
          return {text:e}
        })
        // NOTE: This is assumed to enter in a predictable order (mini-Mongo should be consistent)
        self.wlistColl.batchInsert(words)
      } else {
        FlowRouter.go('walletCreate', {type:'mnemonic'})
      }
    }

    self.init()
    // self.setShuffledWordsArray()
    
    self.autorun(function() {
    })
  })

  Template.walletNewMnemonicConfirm.helpers({
    wordslist () {
      return Tracker.nonreactive(function() {
        const t = Template.instance()
        return t.getShuffledWords()
      })
      // const words = t.wlistColl.find().fetch()
      // we need to randomize this consistently...?
      // const words = Template.instance().getShuffleWordListArray()
      // // const words = Template.instance().getWordListArray()
      // const confWords = Template.instance().getConfirmListArray()
      // // need to blank out choosen ones
      // // const newWords = words.concat(confWords)

      // return words.map(e => {
      //   // THIS WILL FAIL ON DUPLICATES?
      //   const disabled = confWords.find(f => {
      //     return f === e;
      //   });
      //   return {text:e, style: disabled ? "disabled" : ""}
      // })
    },
    confirmWordsList () {
      // const t = Template.instance()
      // TODO: sort this by order added
      return Template.instance().wlistColl.find({confirmed:true},{sort: {sequence: 1}}).fetch()
      // const confWords = t.getConfirmListArray()
      // // add errors
      // return confWords.map(e => {
      //   const err = t.phraseErrors.get(e)
      //   return {text: e, error: err}
      // })

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
      // self.confwlist.set(null)// we need to clear all errors
      // update multiple confirmed statuses
      self.wlistColl.find().fetch().forEach(e => {
        self.wlistColl.update({_id:e._id},{$set: {confirmed: false, error: null, disabled: null}})
      });
      $("#words .btn").removeClass('disabled')
      self.phraseErrors.clear()
    },
    "click [data-event='addConfirmWord']": function (event, self) {
      event.preventDefault()
      const tar = event.currentTarget
      
      const wordId = tar.dataset.param
      const confs = self.wlistColl.find({confirmed: true},{sort: {sequence: 1}}).fetch()
      const lastSequence = confs[confs.length-1] && confs[confs.length-1].sequence
      const newSequence = lastSequence >= 0 ? lastSequence + 1 : 0;
      
      self.wlistColl.update({_id:wordId},{$set: {confirmed:true, sequence: newSequence}})
      $(tar).addClass("disabled")
      // Add disabled class
      // let confWords = self.getConfirmListArray()
      // PREVENT DUPLICATES
      // NOTE: SOME MNEMONICS HAVE DOUBLE WORDS (rare)!!!!
      // set disabled: "disabled"
      // set
      // const filled = () => {
      //   const wConfInstances = self.wlistColl.find({text:theword,})
      //   const wInstances = self.wlistColl.find({text:theword})
      //   if (wConfInstances.length >= wInstances.length) {
      //     return true
      //   } else {
      //     return false
      //   }
      //   // how to know if 
      //   // just has to return true
      //   // return e === theword
      // }
      // const exists = confWords.find(e => { return e === theword})
      // if (!exists) {
      // if (!filled()) {
      //   const newConfWords = confWords.length > 0 ? confWords.join(" ").concat(" " + theword) : theword;
      //   self.confwlist.set(newConfWords)
      //   self.formErrors.set('mnemonic', null)
      // }
    },
    "click [data-event='removeConfirmWord']": function (event, self) {
      event.preventDefault()
      const tar = event.currentTarget
      const wordId = tar.dataset.param
      const res = self.wlistColl.update({_id:wordId},{$set:{confirmed:false, error: null, sequence:null}})
      $('#words [data-param=' + wordId + ']').removeClass("disabled")
      // const removed = self.wlistColl.find(res)
      // console.log("wtf no removing?");
      
      // console.log(theword);
      
      // let confWords = self.getConfirmListArray()
      // let removed
      // // why does this fail for words not at the end...
      // console.log(confWords);
      // for (let i = 0; i < confWords.length; i++) {
      //   const e = confWords[i];
      //   if (e === theword) {
      //    removed = confWords.splice(i, 1)
      //   }
      // }
      // self.phraseErrors.set(removed.text, null)
      self.formErrors.set('mnemonic', null)
      // self.confwlist.set(confWords.join(" "))
    },
    "keyup #generate-wallet-form input": function (event, self) {
      const name = event.currentTarget.name
      self.formErrors.set(name,'')
    },
    "submit #generate-wallet-form": async function (event, self) {
      event.preventDefault();
      const t = event.currentTarget
      const validationContext = Schemas.formNewMnemonicWallet.namedContext('createMnemonicWallet');
      const phrase = self.wlistColl.find().map(e => {return e.text}).join(" ")
      const repeatPhrase = self.wlistColl.find({confirmed:true}).map(e => {return e.text}).join(" ")
      const obj = validationContext.clean({
        phrase: phrase,
        repeatPhrase: repeatPhrase,
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
