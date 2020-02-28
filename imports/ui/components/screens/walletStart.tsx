import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

export default function StartScreen () {
  return (

    <div className="row">

      <div className="col-md-8 col-lg-6 ml-auto mr-auto">
        <img className="mx-auto d-block w-25 mb-5" src="/img/Asgard-Wallet-Gradient-512.svg" />
        <h5 className="text-center mb-5">Asgard Wallet</h5>
        <a className="form-control btn btn-dark btn-brand-border mb-4" href={FlowRouter.path('walletCreate')}>
          <span>New</span>
        </a>
        <div className="form-group">
          <a className="form-control btn btn-primary w-100 mb-4" href={FlowRouter.path('walletImport')}>Import</a>
        </div>

        <div>
          <div className="h5 text-uppercase text-center">Attention:</div>
          <p className="text-justify"> This beta software is provided for testing purposes as is, with no warranty. Usage is restricted to Binance testnet.</p>
        </div>
      </div>

    </div>
  )
}
