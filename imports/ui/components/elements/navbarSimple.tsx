import React from 'react'
import { FlowRouter } from 'meteor/kadira:flow-router';

export default function NavbarSimple () {
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
            <a className={linkClasses('options')} href={FlowRouter.path('options')}>
              <i className="fa fa-lg fa-cog"></i>
            </a>
          </li>
          <li className="nav-item">
            <a className={linkClasses('walletUnlock')} href={FlowRouter.path('walletUnlock')}>
              <i className="fa fa-lg fa-unlock"></i>
            </a>
          </li>
        </ul>
      </div>
    </nav>

  )
  
}
