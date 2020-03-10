import React, { useState } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { WALLET } from '/imports/startup/client/init'
import { UserAccount, UserAssets } from '/imports/api/collections/client_collections'
import { UserAssetsTypes } from '/imports/api/collections/userAssetsCollection'
import FreezeFundsFormSchema from '/imports/lib/schemas/freezeFundsFormSchema'

type Props = { symbol: string }
const FreezeFundsScreen: React.FC<Props> = ({symbol}): JSX.Element => {
  const [amountError, setAmountError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const freezeFunds = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tar = event.currentTarget
    const account = UserAccount.findOne()
    const balances = userAsset
    
    const validationContext = FreezeFundsFormSchema.namedContext('freezeFunds');
    const obj = validationContext.clean({
      pwHash: account.pwHash,
      maxAmount: balances && balances.free || 0,
      sender: account.address,
      amount: tar.amount.value,
      asset: symbol,
      password: tar.password.value
    });
    await validationContext.validate(obj)
    // delay to show change before crypto ui lag
    const sleep = (m: number) => new Promise(r => setTimeout(r, m))
    if (!validationContext.isValid()) {
      setAmountError(validationContext.keyErrorMessage('amount'))
      setPasswordError(validationContext.keyErrorMessage('password'))
    } else {
      setLoadingMsg('freezing funds')
      await sleep(200)
      try {
        await WALLET.vaultFreezeFunds(obj.amount, obj.asset, obj.password)
        FlowRouter.go('walletAssetDetails', {symbol:symbol})
      } catch (error) {
        setLoadingMsg('')
        console.log(error)
        // if includes funds, amount error, else
        setAmountError(error.message)
      }

    }

  }
  const userAsset: UserAssetsTypes = useTracker(() => {
    return UserAssets.findOne({symbol:symbol})
  })
  return (
    <div className="row">
      <div className="col-md-8 col-lg-6 ml-auto mr-auto">
        <h5 className="text-center">Freeze Funds</h5>
        <form className="form" onSubmit={freezeFunds}>
          <fieldset {...(loadingMsg ? {disabled:true} : {})}>

            <div className="form-row">
              <div className="form-group col-md-12 mb-2">
                <label htmlFor="inputAmount">Amount</label>
                <input type="text" className="form-control mb-3" name="amount" id="inputAmount" aria-describedby="amountHelp" placeholder="0.00" />
                <small className={amountError ? ("form-text text-warning") : ('form-text text-info')}>
                  {amountError ? (
                    amountError
                  ) : (
                    <span>Max funds: {userAsset.free}</span>
                  )}
                </small>
              </div>

              <div className="form-group col-md-12 mb-2">
                <label htmlFor="inputPassword">Password</label>
                <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password" />
                <small className="form-text text-warning">{passwordError}</small>
              </div>
            </div>

            <button className="btn btn-primary w-100" type="submit">

              {!loadingMsg &&(
                <span>Freeze</span>
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
export default FreezeFundsScreen