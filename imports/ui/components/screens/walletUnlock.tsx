import React, { useState } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wallet } from "../../../../client/lib/init";

type UnlockScreenStateTypes = { pwError: string; loadingMsg: string;}
const UnlockScreen: React.FC<UnlockScreenStateTypes> = () => {
  const [pwError, setPwError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");
  const handlePwChange = () => { setPwError('') }

  const unlockWallet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tar = event.currentTarget

    if (!tar.password || !tar.password.value || tar.password.value.length === 0) { 
      setPwError('Password required')
    } else {
      setLoadingMsg('unlocking')
      try {
        await Wallet.unlockAndSync(tar.password.value)
        FlowRouter.go('walletAssets')
      } catch (err) {
        setPwError(err.message)
        setLoadingMsg('')
				throw new Error(err.message)
      }

    }
  }
  return (

    <div className="row">

      <div className="col-md-8 col-lg-7 col-xl-7 ml-auto mr-auto">
        <img className="mx-auto d-block w-25 mb-5" src="/img/Asgard-Wallet-Gradient-512.svg"/>
      </div>

      <div className="col-md-8 col-lg-7 col-xl-7 ml-auto mr-auto">

        <form id="wallet-unlock-form" className="form" onSubmit={unlockWallet}>
          <fieldset {...(loadingMsg ? {disabled:true} : {})}>

            <div className="form-row">
              <div className="form-group col-md-12">
                <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password" onChange={handlePwChange} />
                <small id="passwordHelp" className="form-text text-warning">{pwError}</small>
              </div>
            </div>
            <button type="submit" className="form-control btn btn-primary">
              {!loadingMsg &&(
                <span>Unlock</span>
              )} 
              {loadingMsg && (
                <span>
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <span className="ml-1">{loadingMsg}</span>
                </span>
              )}
            </button>

          </fieldset>
        </form>

      </div>

    </div>
  )
}
export default UnlockScreen