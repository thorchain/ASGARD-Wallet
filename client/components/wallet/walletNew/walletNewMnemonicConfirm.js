import './walletNewMnemonicConfirm.html'
import { WALLET } from '/imports/startup/client/init'
import Schemas from '/client/schemas/newWalletFormSchema'

if (Meteor.isClient) {
  Template.walletNewMnemonicConfirm.onCreated(function() {
    const self = this
    // This is for pure reference, as it is created by Binance lib
    self.wlist = new ReactiveVar(Session.get('seedphrase'))
    // we have to create a dict with id's to prevent duplicates problem
    // So we just use a collection, with additional flexibility
    self.wlistColl = new Mongo.Collection(null)
    self.phraseErrors = new ReactiveDict()
    self.formErrors = new ReactiveDict()
    self.loadingMsg = new ReactiveVar("")

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

    self.getShuffledWords = () => {
      
      const shuffledArr = arr => {
        const newArr = arr.slice()
        for (let i = newArr.length - 1; i > 0; i--) {
          const rand = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
        }
        return newArr
      };

      const thearr = self.wlistColl.find().fetch()
      return shuffledArr(thearr)
    }
    
    self.generateNewWallet = (pw, mnemonic) => {
      WALLET.generateNewWallet(pw, mnemonic).then(async (e) => {
        await WALLET.unlock(pw)
        Session.set('seedphrase', null) // SECURITY:
        FlowRouter.go('home')
      })
    }
    self.checkPhraseConfirmWords = () => {
      // check against original phrase
      const words = self.wlistColl.find().fetch()
      const confWords = self.wlistColl.find({confirmed:true},{sort: {sequence: 1}}).fetch()
      
      if (words.length === confWords.length) {
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

    self.init()
    
    self.autorun(function() {
    })
  })

  Template.walletNewMnemonicConfirm.helpers({
    wordslist () {
      return Tracker.nonreactive(function() {
        const t = Template.instance()
        return t.getShuffledWords()
      })
    },
    confirmWordsList () {
      return Template.instance().wlistColl.find({confirmed:true},{sort: {sequence: 1}}).fetch()
    },
    loadingMsg () { return Template.instance().loadingMsg.get() },
    phraseError () { return Template.instance().formErrors.get('mnemonic')},
    pwError () { return Template.instance().formErrors.get('password')},
    repeatPwError () { return Template.instance().formErrors.get('repeatPassword')},
  })
  Template.walletNewMnemonicConfirm.events({
    "click [data-event='resetPhrase']": function (event, self) {
      event.preventDefault()
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
    },
    "click [data-event='removeConfirmWord']": function (event, self) {
      event.preventDefault()
      const tar = event.currentTarget
      const wordId = tar.dataset.param
      self.wlistColl.update({_id:wordId},{$set:{confirmed:false, error: null, sequence:null}})
      $('#words [data-param=' + wordId + ']').removeClass("disabled")
      self.formErrors.set('mnemonic', null)
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
