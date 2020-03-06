import React from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router';

const NavbarSimple: React.FC = (): JSX.Element => {
  // TODO: memoize?
  const linkClasses = (routeName: string) => {
    return FlowRouter.current().route.name === routeName ? 'nav-link disabled' : 'nav-link'
  }
  return (

    <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-transparent">
      <div className="navbar-brand"></div>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
        <ul className="navbar-nav float-right pr-3">
          <li className="nav-item">
            <a className={linkClasses('options')} data-toggle="collapse" data-target=".navbar-collapse.show" onClick={() => FlowRouter.go('options')}>
              <i className="fa fa-lg fa-cog"></i>
            </a>
          </li>
          <li className="nav-item">
            <a className={linkClasses('walletUnlock')} data-toggle="collapse" data-target=".navbar-collapse.show" onClick={() => FlowRouter.go('walletUnlock')}>
              <i className="fa fa-lg fa-unlock"></i>
            </a>
          </li>
        </ul>
      </div>
    </nav>

  )
}
export default NavbarSimple
