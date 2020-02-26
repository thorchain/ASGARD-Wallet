import React from 'react';
import { Wallet } from "../../../../client/lib/init";

export default class UnlockScreen extends React.Component <{}> {
  constructor(props: {}) {
    super(props)
    this.state = { 
      loadingMsg:"test",
      pwError:"test"
    }
  }
  async unlockWallet(pw: string) {
			try {
        // shoud should loading msgs here
        console.log("We CLICKED" + pw)
        // await Wallet.unlockAndSync(pw)

				// await WALLET.syncUserData()
			} catch (error) {
				this.setState({pwError: error.message})
				throw new Error(error.message)
			}
  }
  buttonContent() {
    return 
  }
  render() {
    // const isLoading = this.state.loadingMsg ? true : false;
    return (

      <div className="row">

        <div className="col-md-8 col-lg-6 ml-auto mr-auto">
          <img className="mx-auto d-block w-25 mb-5" src="/img/Asgard-Wallet-Gradient-512.svg"/>
        </div>


        <div className="col-md-8 col-lg-6 ml-auto mr-auto">

          <form id="wallet-unlock-form" className="form">
            <fieldset>

              <div className="form-row">
                <div className="form-group col-md-12">
                  <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password"/>
                  <small id="passwordHelp" className="form-text text-warning">{{pwError}}</small>
                </div>
              </div>
              <button type="submit" className="form-control btn btn-primary">
                {/* {{#if loadingMsg}} */}
                {/* {this.state.loadingMsg} */}
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                {/* {this.state.loadingMsg} */}
                {/* {{else}}Unlock{{/if}} */}
              </button>

            </fieldset>
          </form>

        </div>

      </div>
    )
  }
}