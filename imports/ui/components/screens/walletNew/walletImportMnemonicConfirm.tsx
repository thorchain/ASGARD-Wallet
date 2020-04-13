import React, { useEffect, useState, useMemo } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { Mongo } from 'meteor/mongo'
import { WALLET } from '/imports/startup/client/init'
import { Session } from 'meteor/session'
import { NewMnemonicWalletFormSchema } from '/imports/lib/schemas/newWalletFormSchemas'

// TODO: In this file, fill 'any' gaps/workarounds for types

const selectedWordsColl = new Mongo.Collection(null) // local only client
type wordTypes = {
  _id?:string;
  sequence?:number;
  error?:string;
  text:string;
}

const MnemonicConfirmScreen: React.FC = (): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [mnemonicError, setMnemonicError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [repeatPasswordError, setRepeatPasswordError] = useState<string>('')

  // Pseudo contructor...
  function init() {
    let words = Session.get('mnemonic') && Session.get('mnemonic').split(" ")
    if (words) {
      words = words.map((e:string) => {
        return {text:e}
      })
      // NOTE: This is assumed to enter in a predictable order (mini-Mongo should be consistent)
      selectedWordsColl.batchInsert(words) // TODO: Define type for this method
    } else {
      FlowRouter.go('walletCreate',{type:'mnemonic'})
    }
  }
  useEffect(() => {
    return () => {
      selectedWordsColl.remove({}) // Eliminates persistance...
    }
  },[])
  
  const shuffledWords = useMemo(() => {
    init()
    const shuffledArr = (arr: any): any[] => { // any for now: TODO: Add formats
      const newArr = arr.slice()
      for (let i = newArr.length - 1; i > 0; i--) {
        // swap with random
        const rand = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
      }
      return newArr

    };
    const theArr = selectedWordsColl.find().fetch()
    return shuffledArr(theArr)
  },[])
  const selectedWords = useTracker(() => {
    return selectedWordsColl.find({selected:true},{sort: {sequence: 1}}).fetch()
  },[selectedWordsColl])
  const isSelected = (id:string) => useTracker(() => {
    const res:any = selectedWordsColl.findOne(id)
    return (res && res.selected)
  },[selectedWordsColl])

  const checkPhraseConfirmWords = () => {
    // check against original phrase
    const words = selectedWordsColl.find().fetch() // original order
    const selectedWords = selectedWordsColl.find({selected:true},{sort: {sequence: 1}}).fetch()
    
    // NOTE: This can not fully (really?) be done in schema if needing word specific errors
    if (words.length === selectedWords.length) {
      
      let isErr = false
      for (let i = 0; i < words.length; i++) {
        const word:any = words[i]
        const selectWord:any = selectedWords[i];
        
        if (word._id !== selectWord._id) {
          selectedWordsColl.update({_id:selectWord._id},{$set:{error:"danger"}})
          isErr = true
        }
      }
      return !isErr
      
    } else {
      setMnemonicError('Complete confirmation')
      return false
    }

  }


  const handleResetPhrase = () => {
    selectedWordsColl.find().fetch().forEach((e:any) => {
      selectedWordsColl.update({_id:e._id},{$set: {selected: false, error: ''}})
    });
    setMnemonicError('')
  }
  const handleAddWord = (id:string) => {
    const selects: wordTypes[] | any = selectedWordsColl.find({selected: true},{sort: {sequence: -1}, limit:1}).fetch()
    const lastSequence = selects[0] && selects[0].sequence || 0
    const newSequence = lastSequence >= 0 ? lastSequence + 1 : 0;
    selectedWordsColl.update({_id:id},{$set: {selected:true, sequence: newSequence}})
    setMnemonicError('')
  }
  const handleRemoveWord = (id:string) => {
    selectedWordsColl.update({_id:id},{$set:{selected:false, error: null, sequence:null}})
    setMnemonicError('')
  }
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // handle the form
      event.preventDefault();
      const tar = event.currentTarget
      const validationContext = NewMnemonicWalletFormSchema.newContext();
      const phrase = selectedWordsColl.find().map((e:any) => {return e.text}).join(" ")
      
      const repeatPhrase = selectedWordsColl.find({selected:true}).map((e:any) => {return e.text}).join(" ")
      
      const obj = validationContext.clean({
        phrase: phrase,
        repeatPhrase: repeatPhrase,
        password: tar.password.value,
        repeatPassword: tar.repeatPassword.value
      })

      validationContext.validate(obj);
      const wordscheck = checkPhraseConfirmWords()

      if (!validationContext.isValid() || !wordscheck) {
        if (!wordscheck) {
          setMnemonicError('Incorrect phrase')
        } else {
          setMnemonicError(validationContext.keyErrorMessage('repeatPhrase'))
        }
        setPasswordError(validationContext.keyErrorMessage('password'))
        setRepeatPasswordError(validationContext.keyErrorMessage('repeatPassword'))
      } else {

        setLoadingMsg('generating wallet')
        setTimeout(async () => {
          try {
            const network = Session.get('network')
            const mnemonic = Session.get('mnemonic');
            WALLET.generateNewWallet(obj.password, mnemonic, null, network).then(async () => {
              await WALLET.unlock(obj.password)
              Session.set('mnemonic', null) // SECURITY: unset
              Session.set('network', null) // SECURITY: unset
              FlowRouter.go('walletAccounts')
            })
          } catch (err) {
            setLoadingMsg('')
            console.log(err)
          }
        }, 200);

      }
  }
  return (
    <div className="row">
      <div className="col-md-8 mx-auto">
        <form name="generate-wallet-form" id="generate-wallet-form" className="form" onSubmit={handleFormSubmit}>

          <h5 className="text-center mb-4">Confirm Mnemonic</h5>
          <div id="confirm-words" className="card border mb-3" style={{minHeight:'138px'}}>
            <div className="card-body p-2">
              <div className="h3 mb-0 text-justify">
                {selectedWords.map((word:any) => (
                  <a className={"badge badge-lg badge-light position-relative pr-2 m-1 text-" +(word.error ? 'danger' : 'white') + " " + (loadingMsg && "disabled")}
                    onClick={() => handleRemoveWord(word._id)}
                    key={word._id}>
                    <span>{word.text}</span>
                    <span className="ml-1 text-muted"><i className="fa fa-sm fa-times"></i></span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="d-flex">
            <div id="phraseHelp" className="form-text text-warning small">{mnemonicError}</div>
          </div>

          <div className="row my-3">

            <div className="col-12">
              <label className="display-block">Select in correct order
                <span className="btn btn-sm btn-text mr-auto" onClick={handleResetPhrase}><i className="fa fa-redo"></i></span>
              </label>
            </div>

            {shuffledWords.map((word:any) => (
              <div className="col-6 col-md-3 h4" key={word._id}>
                <span
                  className={"btn btn-sm btn-primary w-100" + (isSelected(word._id) && ' disabled' || '')}
                  onClick={() => handleAddWord(word._id)}>{word.text}</span>
              </div>
            ))}

          </div>
          <fieldset {...(loadingMsg ? {disabled:true} : {})}>
            <div className="form-row">

              <div className="form-group col-md-12">
                <label htmlFor="inputPassword">Encryption Password</label>
                <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password"/>
                <small id="passwordHelp" className="form-text text-warning">{passwordError}</small>
              </div>

              <div className="form-group col-md-12">
                <label htmlFor="repeatPassword">Repeat Password</label>
                <input type="password" className="form-control mb-3" name="repeatPassword" id="repeatPassword" aria-describedby="repeatPasswordHelp" placeholder="password"/>
                <small id="repeatPasswordHelp" className="form-text text-warning">{repeatPasswordError}</small>
              </div>

              <div className="form-group col-md-12">

                  <button type="submit" className="form-control btn btn-dark btn-brand-border">
                    {!loadingMsg ? (
                      <span>Create</span>
                    ) : (
                      <span>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <span className="ml-1">{loadingMsg}</span>
                      </span>
                    )}
                  </button>

              </div>
            </div>
          </fieldset>

        </form>
      </div>

    </div>

  )
}

export default MnemonicConfirmScreen
