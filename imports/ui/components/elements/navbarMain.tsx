import React from 'react'
import { WALLET } from '/imports/startup/client/init'
import { UserAssets } from '/imports/api/collections/client_collections'
// import ReactDOM from "react-dom";
import { FlowRouter } from 'meteor/kadira:flow-router'

const NavbarMain: React.FC = (): JSX.Element => {
  const hasFunds = (): boolean => {
    return UserAssets.find().count() > 0
  }
  const lockWallet = () => {
    WALLET.lock()
    FlowRouter.go('walletUnlock')
  }
  const linkClasses = (routeName: string) => {
    return FlowRouter.current().route.name === routeName ? 'nav-link active' : 'nav-link'
  }
  
  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-dark">
      <a className="navbar-brand text-uppercase font-size-h5" href={FlowRouter.path('home')}>
        <img src="/img/Asgard-Tri-White.png" className="float-left mr-2" width="28" height="28" alt="" />
        <span className="font-weight-bold">Asgard</span><span>&nbsp;Wallet</span><span className='small text-muted pl-2'>BETA</span>
      </a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>


      <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
        <ul className="navbar-nav text-right">
          <li className="nav-item">
            <a className={linkClasses('walletAssets')} onClick={()=>FlowRouter.go('walletAssets')} data-toggle="collapse" data-target=".navbar-collapse.show">Assets</a>
          </li>
          <li className="nav-item">
            <a className={linkClasses('walletTransactionsList')} onClick={()=>FlowRouter.go('walletTransactionsList')} data-toggle="collapse" data-target=".navbar-collapse.show">Transactions</a>
          </li>
          {hasFunds() && (
            <li className="nav-item">
              <a className={linkClasses('walletSend')} onClick={()=> FlowRouter.go('walletSend')} data-toggle="collapse" data-target=".navbar-collapse.show">Send</a>
            </li>
          )}
          <li className="nav-item">
            <a className={linkClasses('walletReceive')} onClick={()=>FlowRouter.go('walletReceive')} data-toggle="collapse" data-target=".navbar-collapse.show">Receive</a>
          </li>
          <li className="nav-item">
            <a className={linkClasses('walletAccounts')} onClick={()=>FlowRouter.go('walletAccounts')} data-toggle="collapse" data-target=".navbar-collapse.show">Account</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" onClick={lockWallet} data-toggle="collapse" data-target=".navbar-collapse.show">Lock</a>
          </li>
        </ul>
      </div>

      <div className="navbar-border position-absolute bg-brand-gradient">&nbsp;</div>
    </nav>

  )

}
export default NavbarMain
