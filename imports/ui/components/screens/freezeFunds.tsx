
import React, { useState } from 'react'
import { WALLET } from '/imports/startup/client/init'
import { UserAccount, UserAssets } from '/imports/api/collections/client_collections'

import FreezeFundsFormSchema from '/imports/lib/schemas/freezeFundsFormSchema'

type Props = { symbol: string }
const FreezeFundsScreen: React.FC<Props> = ({symbol}): JSX.Element => {
  // TODO: Add useTracker(?)
  const [amountError, setAmountError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const freezeFunds = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const t = event.currentTarget
    const account = UserAccount.findOne()
    const from = account.address
      // const param = FlowRouter.getParam('asset')
      const asset = symbol
    // Schema based validation
    // TODO: Add max amount to pre-check insufficient funds
    const balances = UserAssets.findOne({symbol:symbol})
    
    const validationContext = FreezeFundsFormSchema.namedContext('stakeFunds');
    const obj = validationContext.clean({
      pwHash: account.pwHash,
      maxAmount: balances && balances.free || 0,
      sender: from,
      amount: t.amount.value,
      asset: asset,
      password: t.password.value
    });
    await validationContext.validate(obj)
    // Dont think we need?
    // const sleep = m => new Promise(r => setTimeout(r, m))
    // handle errors
    if (!validationContext.isValid()) {
      setAmountError(validationContext.keyErrorMessage('amount'))
      setPasswordError(validationContext.keyErrorMessage('password'))
    } else {
      console.log("attempting freezing funds: " + symbol);
      try {
        const res = WALLET.vaultFreezeFunds(obj.amount, obj.asset, obj.password)
        console.log("SUCCESS")
        console.log(res);
        
      } catch (error) {
        console.log(error)
      }

    }

  }
  // const unfreezeFunds = () => {
  //   console.log("unfreezing funds: " + symbol);
  // }
  return (
    <div className="row">
      <div className="col">
        <h5 className="text-center">Stake Funds</h5>
        <form className="form" onSubmit={freezeFunds}>
          <fieldset>

            <div className="form-row">
              <div className="form-group col-md-12 mb-2">
                <label htmlFor="inputAmount">Amount</label>
                <input type="text" className="form-control mb-3" name="amount" id="inputAmount" aria-describedby="amountHelp" placeholder="0.00" />
                <small className={amountError ? ("form-text text-warning") : ('form-text text-info')}>
                  {amountError && (
                    amountError
                  )}
                  {!amountError && symbol && (
                    <span>Max funds: 0.00</span>
                  )}
                </small>
              </div>

              <div className="form-group col-md-12 mb-2">
                <label htmlFor="inputPassword">Password</label>
                <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password" />
                <small className="form-text text-warning">{passwordError}</small>
              </div>
            </div>

            <button className="btn btn-primary w-100" type="submit">Freeze</button>

          </fieldset>
        </form>

      </div>

    </div>
  )
}
export default FreezeFundsScreen