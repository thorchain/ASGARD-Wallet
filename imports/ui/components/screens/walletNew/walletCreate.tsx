import React, { useState, useEffect } from 'react'
import { Session } from 'meteor/session'
import bip39 from 'bip39'

import WalletCreateForm from './walletCreateForm'

const CreateScreen: React.FC<{type?:string}> = ({type}): JSX.Element => {
  const [isMnemonic, setIsMnemonic] = useState<boolean>(false)
  const [mnemonic, setMnemonic] = useState<string>('')
  
  useEffect(()=>{
    if (type && type === 'mnemonic') { setIsMnemonic(true) }
    console.log('using an effect')
    let mnemonic
    if (Session.get('mnemonic')) {
      console.log("setting existing mnemonic");
      
      setMnemonic(Session.get('mnemonic'));
    } else {
      mnemonic = bip39.generateMnemonic();
      // check for duplicates
      let findDuplicates = (arr: string[]) => arr.filter((item, index) => arr.indexOf(item) != index)

      let duplicates = false
      while (!duplicates) {
        if (findDuplicates(mnemonic.split(" ")).length > 0) {
          console.log("we got a duplicate in new mnemonic");
          // reroll mnemonic. low odds for double duplicate
          // confirm UI should handle it as well
          mnemonic = bip39.generateMnemonic()
        } else {
          duplicates = true
        }
      }
      console.log("setting new mnemonic");
      setMnemonic(mnemonic);
      Session.set('mnemonic', mnemonic);
    }
  },[])

  const wordsList  = function() {
    return mnemonic.length ? mnemonic.split(' ') : [] ;
  }

  return (
    <div className="row">

      <div className="col-md-8 mr-auto ml-auto">
        <h5 className="mb-4 text-center">Create New Wallet</h5>
      </div>


      <div className="col-md-8 mr-auto ml-auto">

        <ul className="nav nav-tabs d-flex justify-content-center mb-4">
          <li className="nav-item">
            <a className={"nav-link" + (!isMnemonic && (" active") || "")} onClick={() => setIsMnemonic(false)}>Keystore</a>
          </li>
          <li className="nav-item">
            <a className={"nav-link" + (isMnemonic && (" active") || "")} onClick={() => setIsMnemonic(true)}>Mnemonic</a>
          </li>
        </ul>

        {isMnemonic ? (
          <div>
            <label>Mnemonic HD wallet seed phrase</label>
            <div className="card mb-3 border">
              <div className="card-body">
                <div className="h3 text-justify">
                  {wordsList().map((word:string, i) => (
                    <span className="badge badge-lg badge-light m-1" key={i}>{word}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-warning my-4 font-weight-bold">This is the phrase used to seed your wallet accounts. Record and keep this in a safe place. If you loose access to your wallet and backups, your account can <strong className="text-underline">only</strong> be recovered using this phrase.</p>
            <a type="button" className="form-control btn btn-dark btn-brand-border" onClick={() => FlowRouter.go('walletMnemonicConfirm')}>
              <span>Next</span>
            </a>

          </div>
        ) : (
          <WalletCreateForm/>
        )}
      </div>
    </div>
  )
}
export default CreateScreen

