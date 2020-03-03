import React,  { useMemo }from 'react'
import { WALLET } from '/imports/startup/client/init'

const UnlockOptionsScreen: React.FC = (): JSX.Element => {
  const downloadLink = useMemo(() => {
    const keystore: string = window.localStorage.getItem('binance') || ""
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
  }, [])
  const removeWallet = async () => {
    try {
      await WALLET.resetWallet()
      // SECURITY NOTE: this needs to await for above, to ensure dependent route's security
      FlowRouter.go('start') 
    } catch (error) {
      console.log(error)
      // handle the error
    }
  }
  return (
    <div className="row">
      <div className="col-md-8 col-lg-6 ml-auto mr-auto">
        <h5 className="text-center mb-5">Options</h5>

        <input type="button" className="btn btn-primary w-100 my-2" value="Lock Wallet" data-event="lockWallet" />
        <a href={downloadLink} download="keystore.txt" className="btn btn-primary w-100 mb-2">Export Keystore</a>
        <input type="button" className="btn btn-danger w-100 my-3" value="Remove Wallet" onClick={removeWallet} />

      </div>
    </div>
  )
}
export default UnlockOptionsScreen