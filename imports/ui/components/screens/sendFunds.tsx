import React, { useState, useEffect, useMemo } from 'react'
import { useTracker } from 'meteor/react-meteor-data'
import { WALLET } from '/imports/startup/client/init'
// import { BNB } from '/imports/api/wallet'
import { UserAssetsTypes } from '/imports/api/collections/UserAssetsCollection'
import { TokenDataTypes } from '/imports/api/collections/TokenDataCollection'
// import { UserAccountTypes } from '/imports/api/collections/UserAccountCollection'
import { UserAccount, UserAssets, TokenData } from '/imports/api/collections/client_collections'
import CircleIcon, { Sizes } from '/imports/ui/components/elements/circleIcon'
import { shortSymbol } from '/imports/ui/lib/tokenHelpers'
import { toCrypto } from '/imports/ui/lib/numbersHelpers'

const SendFundsScreen: React.FC<{symbol?:string}> = ({symbol}): JSX.Element => {
  const tokenData: TokenDataTypes[] = useTracker(() => {
    return TokenData.find().fetch()
  })
  const userAssets: UserAssetsTypes[] = useTracker(() => {
    return UserAssets.find({},{sort:{symbol:1}}).fetch()
  })
  return (
    <div className="row">
      <h5 className="col-12 text-center mb-4">Send Funds</h5>
      {symbol && (
          <div className="col-12">
            <SendFundsAssetSelector userAssets={userAssets} assetsData={tokenData} symbol={symbol}/>
          </div>
      )}

      <div className="col-md-8 col-lg-6 ml-auto mr-auto">
        <SendFundsForm userAssets={userAssets} assetsData={tokenData} symbol={symbol}/>
      </div>

    </div>
  )
}
export default SendFundsScreen

type SendFundsFormProps = {userAssets: UserAssetsTypes[],assetsData: TokenDataTypes[],symbol?:string}
const SendFundsForm: React.FC<SendFundsFormProps> = ({userAssets,assetsData,symbol}): JSX.Element => {
  const [loadingMsg, setLoadingMsg] = useState<string>('')
  const [recipientError, setRecipientError] = useState<string>('')
  const [amountError, setAmountError] = useState<string>('')
  const [amountMsg, setAmountMsg] = useState<string>('')
  const [assetError, setAssetError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [symb, setSymb] = useState<string>('')
  const [selected, setSelected] = useState<string>('default') // used only for select

  useEffect(() => {
    console.log("using effect")
    if (symbol) { setSymb(symbol) }
    if (userAsset) {
      setAmountMsg('Available balance: ' + (userAsset.free) + ' ' + userAsset.shortSymbol)
    } else {
      setAmountMsg('')
    }
  },[symbol])

  const userAsset = useMemo(() => {
    if (symb) {
      const ret = userAssets.find((e: UserAssetsTypes) => e.symbol === symb)
      return ret
    }
  },[symb])

  const handleSelectChange = (event: React.FormEvent<HTMLSelectElement>) => {
    const tar = event.currentTarget
    setSelected(tar.value)
    setSymb(tar.value)
  }
  const handleSendFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tar = event.currentTarget
    const acc = UserAccount.findOne()
    const from = acc.address

    // Schema based validation
    const validationContext = Schemas.formTransferTx.newContext();
    // TODO: Add check fee amount to pre-check insufficient fee funds
    const obj = validationContext.clean({
      pwHash: acc.pwHash,
      maxAmount: userAsset?.free, // form should never handle with no asset
      sender: from,
      recipient: tar.recipient.value,
      amount: tar.amount.value,
      asset: symb,
      password: tar.password.value
    });
    
    validationContext.validate(obj);
    console.log("WTF")
    console.log(validationContext.isValid())
    console.log(validationContext.validationErrors())
    if (validationContext.isValid()) {
      const sleep = (m:number) => new Promise(r => setTimeout(r, m))
      setLoadingMsg("preparing tx")
      await sleep(200)
      console.log("transferring...");
      
      WALLET.on('transfer', (msg:string) => { setLoadingMsg(msg) })
      try {
        await WALLET.transferFunds(obj.sender, obj.recipient, obj.amount, obj.asset, obj.password)
        delete obj.password // SECURITY: unset
        FlowRouter.go('walletAssetDetails',{symbol: obj.asset})
      } catch (error) {
          setLoadingMsg('')
          console.log(error)
          if (error.message.includes('password')) { 
            setPasswordError(error.message)
          } else if (error.message.includes('funds')) {
            setAmountError(error.message)
          } 
      }
      
    } else {
      setLoadingMsg('')
      setRecipientError(validationContext.keyErrorMessage('recipient'))
      setAmountError(validationContext.keyErrorMessage('amount'))
      setAssetError(validationContext.keyErrorMessage('asset'))
      setPasswordError(validationContext.keyErrorMessage('password'))
    }

  }

  return (
    <form id="send-transaction-form" className="form" onSubmit={handleSendFormSubmit}>
      <fieldset {...(loadingMsg ? {disabled:true} : {})}>
        <div className="form-row">

          <div className="form-group col-md-12 mb-2">
            <label htmlFor="inputRecipient">Recipient</label>
            <input type="text" className="form-control mb-3" name="recipient" id="inputRecipient" aria-describedby="amountHelp" placeholder="recipient"/>
            <small id="amountHelp" className="form-text text-warning">{recipientError}</small>
          </div>

          {!symbol && (

            <div className="form-group col-md-12 mb-2">
              <label htmlFor="inputAsset">Asset</label>
              <select className="form-control custom-select mb-3" id="inputAsset" name="asset" value={selected} onChange={handleSelectChange}>
                <option value="default">Select Asset</option>
                {userAssets.map(asset => (
                  <option value={asset.symbol} key={asset._id}>{asset.symbol} ({asset.free})</option>
                ))}
              </select>
              <small className="form-text text-warning">{assetError}</small>
            </div>

          )}

          <div className="form-group col-md-12 mb-2">
            <label htmlFor="inputAmount">Amount</label>
            <input type="text" className="form-control mb-3" name="amount" id="inputAmount" aria-describedby="amountHelp" placeholder="0.00"/>
            <small className={"form-text text-" + (amountError ? "warning" : "accent")}>
              {amountError ? amountError : (amountMsg)}
            </small>
          </div>

          <div className="form-group col-md-12 mb-2">
            <label htmlFor="inputPassword">Password</label>
            <input type="password" className="form-control mb-3" name="password" id="inputPassword" aria-describedby="passwordHelp" placeholder="password"/>
            <small className="form-text text-warning">{passwordError}</small>
          </div>


          <div className="form-group col-md-12 my-2">
            <button type="submit" className="form-control btn btn-dark btn-brand-border">
              {!loadingMsg ? (
                <span>Send</span>
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

type SendFundsAssetSelectorProps = {userAssets: UserAssetsTypes[], assetsData: TokenDataTypes[], symbol:string}
const SendFundsAssetSelector: React.FC<SendFundsAssetSelectorProps> = ({userAssets,assetsData,symbol}): JSX.Element => {
  const getTokenName = (sym:string) => {
    const a = assetsData.find((asset: TokenDataTypes) => {return asset.symbol === sym} )
    return a && a.name
  }
  const token = useMemo(() => {
    return assetsData.find((e: TokenDataTypes)=> e.symbol === symbol)
  },[symbol])
  return (
        <div className="media my-4">

          <div className="d-flex mr-3">
            <CircleIcon shortSymbol={shortSymbol(symbol)} size={Sizes.md}/>
          </div>

          <div className="media-body">
            <div className="mt-0">{token && token.name}&nbsp;({shortSymbol(symbol)})</div>
            <div className="dropdown">
              <a className="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
                Change
              </a>
            
              <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                {userAssets.map((asset: UserAssetsTypes) => (
                    <a className={"dropdown-item d-flex align-items-baseline" + (asset.symbol === symbol ? " active": " text-dark")} key={asset._id} onClick={() => FlowRouter.setParams({symbol: asset.symbol})}>
                      <div className="mr-2">{shortSymbol(asset.symbol)}</div>&nbsp;
                      <div className="small">{getTokenName(asset.symbol)}</div>&nbsp;
                      <div className="d-inline-block ml-auto small">({toCrypto(asset.free)})</div>
                    </a>
                ))}
              </div>
            </div>

          </div>
        </div>
  )
}