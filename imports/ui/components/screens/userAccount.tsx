import React, { useMemo, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { UserAccount } from '/imports/api/collections/client_collections'
import { UserAccountTypes } from '/imports/api/collections/userAccountCollection';

import { WALLET } from '/imports/startup/client/init'

type ClientTypes = {network: string, chainId: string}
const UserAccountScreen: React.FC = (): JSX.Element => {
  // TODO: Make reactive when we handle connection errors
  const client: ClientTypes = useMemo(() => {
    let obj
    try {
      const res: any = WALLET.getClient() // Undefined source
      obj = {chainId:res.chainId,network:res.network}
    } catch (error) {
      console.log(error) // TODO: Only for dev debugging, handle
      obj = {chainId:"",network:""}
    }
    return obj
  },[])
  const userAccount: UserAccountTypes = useTracker(() => { return UserAccount.findOne()}, [])

  const downloadLink: string = useMemo(() => {
    const keystore: string = window.localStorage.getItem('binance') || ""
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystore)
  }, [])

  const fileName = useCallback(() => {
    const filename = (userAccount.address).concat('-keystore.txt')
    return filename
  }, [])

  // Handlers
  const lockWallet = async () => {
    try {
      await WALLET.lock()
      FlowRouter.go('walletUnlock')
    } catch (error) {
      console.log(error)
    }
  }
  const removeWallet = async () => { 
    console.log("trying...")
    try {
      await WALLET.resetWallet()
      // SECURITY NOTE: this needs to await for above, to ensure dependent route's security
      FlowRouter.go('walletStart') 
    } catch (error) {
      console.log(error)
      // handle the error
    }
  }

  return (
    <div className="row">
      <div className="col">

        <h5 className="text-center mb-4">Account</h5>
      
        <ul className="nav nav-tabs d-flex justify-content-center mb-4">
          <li className="nav-item">
            <a className="nav-link active" href="#" data-event="toggleNetwork">Testnet</a>
          </li>
          <li className="nav-item disabled">
            <a className="nav-link" href="#" data-event="toggleNetwork">Mainnet</a>
          </li>
        </ul>
      
      
        <div className="row mt-3">
          <div className="col-md-3 mb-4">
            <div className="small">Account</div>
            <div className="text-truncate">{userAccount.address}</div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="small">Keystore Version</div>
            <div>{userAccount.keystore.version}</div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="small">Network</div>
            <div className="text-capitalize">{client.network}</div>
          </div>
          <div className="col-md-3 mb-4">
            <div className="small">Chain ID</div>
            <div className="text-capitalize">{client.chainId}</div>
          </div>
        </div>
      
        <div className="row">
          <div className="col-md-8 col-lg-6 ml-auto mr-auto">
      
            <input type="button" className="btn btn-primary w-100 my-5" value="Lock Wallet" onClick={lockWallet}/>
      
            <h5>Wallet Management</h5>
      
            <input type="button" className="btn btn-primary w-100 my-2 disabled" value="View Phrase" data-event="viewPhrase" />
            <a href={downloadLink} download={fileName} className="btn btn-primary w-100 mb-2">Export Keystore</a>
            <input type="button" className="btn btn-danger w-100 my-3" value="Remove Wallet" onClick={removeWallet} />
      
          </div>
        </div>


      </div>

    </div>
  )
}

export default UserAccountScreen