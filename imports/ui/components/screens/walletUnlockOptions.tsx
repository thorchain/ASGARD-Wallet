import React,  { useMemo }from 'react'
import { WALLET } from '/imports/startup/client/init'


const UnlockOptionsScreen: React.FC = (): JSX.Element => {
  const downloadLink = useMemo(() => {
    const keystore: string = window.localStorage.getItem('binance') || ""
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
  }, [])
  const deleteVault = async () => {
    
    // event.preventDefault();
    console.log("deleting binance vault store");
    // We need to delete everything
    // await WALLET.lock() // this is to flag for app security
    // await UserAccount.remove({})
    // await UserTransactions.remove({})
    // await TokenData.remove({})
    // await MarketData.remove({})
    // await window.localStorage.removeItem("binance"); // vault
    // await localforage.clear(); // persistant store
    // FlowRouter.go('home')
    

  }
  return (
    <div className="row">
      <div className="col-md-8 col-lg-6 ml-auto mr-auto">
        <h5 className="text-center mb-5">Options</h5>

        <input type="button" className="btn btn-primary w-100 my-2" value="Lock Wallet" data-event="lockWallet" />
        <a href={downloadLink} download="keystore.txt" className="btn btn-primary w-100 mb-2">Export Keystore</a>
        <input type="button" className="btn btn-danger w-100 my-3" value="Remove Wallet" onClick={deleteVault} />

      </div>
    </div>
  )
}
export default UnlockOptionsScreen