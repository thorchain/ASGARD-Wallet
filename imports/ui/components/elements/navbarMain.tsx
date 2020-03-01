import React from 'react'
import { WALLET } from '/imports/startup/client/init'
// import { FlowRouter } from 'meteor/kadira:flow-router'

const NavbarMain: React.FC = (): JSX.Element => {
  const hasFunds = (): boolean => {
    return true
  }
  const isUnlocked = (): boolean => {
    return true
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
      <a className="navbar-brand text-uppercase font-size-h5" href="{{pathFor 'home'}}">
        <img src="/img/Asgard-Tri-White.png" className="float-left mr-2" with="28" height="28" alt="" />
        <span className="font-weight-bold">Asgard</span><span>&nbsp;Wallet</span><span className='small text-muted pl-2'>BETA</span>
      </a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon text-info"></span>
        </button>

        {isUnlocked && (

          <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
            <ul className="navbar-nav text-right">
              <li className="nav-item">
                <a className={linkClasses('walletAssets')} href={FlowRouter.path('walletAssets')}>Assets</a>
              </li>
              <li className="nav-item">
                <a className={linkClasses('walletTransactionsList')} href={FlowRouter.path('walletTransactionsList')}>Transactions</a>
              </li>
              {hasFunds && (
                <li className="nav-item">
                  <a className={linkClasses('walletSend')} href={FlowRouter.path('walletSend')}>Send</a>
                </li>
              )}
              <li className="nav-item">
                <a className={linkClasses('walletReceive')} href={FlowRouter.path('walletReceive')}>Receive</a>
              </li>
              <li className="nav-item">
                <a className={linkClasses('walletAccounts')} href={FlowRouter.path('walletAccounts')}>Account</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" tabIndex={-1} onClick={lockWallet}>Lock</a>
              </li>
            </ul>
          </div>

        )}
  <div className="navbar-border position-absolute bg-brand-gradient">&nbsp;</div>
</nav>

  )

}
export default NavbarMain
