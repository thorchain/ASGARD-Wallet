import React, { useState } from 'react'
import { WALLET } from '/imports/startup/client/init'
import { NewWalletFormSchema } from '/imports/lib/schemas/newWalletFormSchemas'

const WalletCreateForm: React.FC = (): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [repeatPasswordError, setRepeatPasswordError] = useState<string>('')
  
  const generateNewWallet = (pw:string) => {
    WALLET.generateNewWallet(pw, null).then(async () => {
      await WALLET.unlock(pw)
      FlowRouter.go('walletAccounts')
    })
  }
  const handleCreateFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tar = event.currentTarget
    const validationContext = NewWalletFormSchema.newContext()

    const obj = validationContext.clean({
      password: tar.password.value,
      repeatPassword: tar.repeatPassword.value
    })

    validationContext.validate(obj);

    if (!validationContext.isValid()) {
      setPasswordError(validationContext.keyErrorMessage('password'))
      setRepeatPasswordError(validationContext.keyErrorMessage('repeatPassword'))
    } else {
      setLoadingMsg("Generating wallet")
      setTimeout(async () => {
        try {
          generateNewWallet(obj.password)
        } catch (err) {
          setLoadingMsg('')
          console.log(err)
        }
      }, 200);

    }
    
  }
  
  return (
    <form id="generate-wallet-form" className="form" onSubmit={handleCreateFormSubmit}>
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

          <p className="text-warning mb-4 font-weight-bold">Make sure to export and backup your keystore file on the next step. This is required to recover this type of account in case of loss of access to wallet</p>

          <div className="form-group col-md-12">

            <button type="submit" className="form-control btn btn-dark btn-brand-border">
              <span>
                {loadingMsg ? (
                  <>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <span className="ml-1">{loadingMsg}</span>
                  </>

                ) : (
                  <>Create</>
                )}
              </span>
            </button>

          </div>
        </div>
      </fieldset>
    </form>
  )
}
export default WalletCreateForm