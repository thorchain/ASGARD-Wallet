import React, { useState } from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { WALLET } from '/imports/startup/client/init'
import { ImportMnemonicFormSchema } from '/imports/lib/schemas/importWalletFormSchemas'

const ImportMnemonicForm: React.FC = (): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [repeatPasswordError, setRepeatPasswordError] = useState('')
  const [mnemonicError, setMnemonicError] = useState('')

  const importMnemonicWallet = (mnemonic: string, password: string) => {
    WALLET.generateNewWallet(password, mnemonic).then(async (e) => {
      await WALLET.unlock(password)
      FlowRouter.go("home")
    }).catch(e => { throw Error(e)}) // TODO: Display some error

  }

  const handleImportFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tar = event.currentTarget
    const validationContext = ImportMnemonicFormSchema.namedContext('importMnemonic');
    const obj = validationContext.clean({
      mnemonic: tar.mnemonic.value,
      password: tar.password.value,
      repeatPassword: tar.repeatPassword.value
    })

    validationContext.validate(obj);

    if (!validationContext.isValid()) {
      setMnemonicError(validationContext.keyErrorMessage('mnemonic'))
      setPasswordError(validationContext.keyErrorMessage('password'))
      setRepeatPasswordError(validationContext.keyErrorMessage('repeatPassword'))
    } else {
      setLoadingMsg("Generating wallet")
      // Delay to allow for UI render DOM update before CPU takes over keystore processing
      setTimeout(() => {
        try {
          importMnemonicWallet(obj.mnemonic, obj.password)
        } catch (err) {
          setLoadingMsg('')
          console.log(err)
        }
      }, 200);

    }
    

  }
  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const tar = event.currentTarget
    switch (tar.name) {
      case 'password':
        setPasswordError('')
        break;
      case 'repeatPassword':
        setRepeatPasswordError('')
        break;
      case 'mnemonic':
        setMnemonicError('')
        break;
    
      default:
        break;
    }
  }
  return (

        <form id="import-mnemonic-form" className="form" onSubmit={handleImportFormSubmit}>
          <fieldset {...(loadingMsg ? {disabled:true} : {})}>

            <div className="form-row">
              <div className="form-group col-md-12">
                <label htmlFor="inputMnemonic">Phrase</label>
                <input type="text" id="inputMnemonic" className="form-control mb-3" placeholder="enter phrase" name="mnemonic" onChange={handleInputChange}/>
                <small id="mnemonicHelp" className="form-text text-warning">{mnemonicError}</small>
              </div>

              <div className="form-group col-md-12">
                <label htmlFor="inputPassword">New Password</label>
                <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password" onChange={handleInputChange}/>
                <small id="passwordHelp" className="form-text text-warning">{passwordError}</small>
              </div>

              <div className="form-group col-md-12">
                <label htmlFor="repeatPassword">Repeat Password</label>
                <input type="password" className="form-control mb-3" name="repeatPassword" id="repeatPassword" aria-describedby="repeatPasswordHelp" placeholder="repeat password" onChange={handleInputChange}/>
                <small id="repeatPasswordHelp" className="form-text text-warning">{repeatPasswordError}</small>
              </div>

              <div className="form-group col-md-12">
                <button type="submit" className="form-control btn btn-dark btn-brand-border">
                  {!loadingMsg ? (
                    <span>Import</span>
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
  )
}
export default ImportMnemonicForm