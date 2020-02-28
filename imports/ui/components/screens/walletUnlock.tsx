import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wallet } from "../../../../client/lib/init";

// interface FormValuesTypes { password: string}
interface UnlockScreenStateTypes { pwError: string; loadingMsg: string;}
export default class UnlockScreen extends React.Component<UnlockScreenStateTypes> {
  state: UnlockScreenStateTypes = {
    pwError: "",
    loadingMsg: ""
  }
  unlockWallet = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tar = event.currentTarget
    if (!tar.password || !tar.password.value || tar.password.value.length === 0) { 
      this.setState({pwError: 'Password required'})
    } else {
      this.setState({loadingMsg: "unlocking"})
      try {
        await Wallet.unlockAndSync(tar.password.value)
        FlowRouter.go('walletAssets')
      } catch (err) {
				this.setState({pwError: err.message, loadingMsg:""})
				throw new Error(err.message)
      }

    }
  }
  render() {
    return (

      <div className="row">

        <div className="col-md-8 col-lg-7 col-xl-7 ml-auto mr-auto">
          <img className="mx-auto d-block w-25 mb-5" src="/img/Asgard-Wallet-Gradient-512.svg"/>
        </div>

        <div className="col-md-8 col-lg-7 col-xl-7 ml-auto mr-auto">

          <form id="wallet-unlock-form" className="form" onSubmit={this.unlockWallet}>
            <fieldset {...(this.state.loadingMsg ? {disabled:true} : {})}>

              <div className="form-row">
                <div className="form-group col-md-12">
                  <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password"/>
                  <small id="passwordHelp" className="form-text text-warning">{this.state.pwError}</small>
                </div>
              </div>
              <button type="submit" className="form-control btn btn-primary">
                {!this.state.loadingMsg &&(
                  <span>Unlock</span>
                )} 
                {this.state.loadingMsg && (
                  <span>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <span className="ml-1">{this.state.loadingMsg}</span>
                  </span>
                )}
              </button>

            </fieldset>
          </form>

        </div>

      </div>
    )
  }
}