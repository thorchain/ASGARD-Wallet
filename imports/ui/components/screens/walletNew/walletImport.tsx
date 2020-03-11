import React, { useState } from 'react'

import ImportKeystoreForm from './walletImportKeystoreForm'
import ImportMnemonicForm from './walletImportMnemonicForm'

const ImportScreen: React.FC = (): JSX.Element => {
  const [isMnemonic, setIsMnemonic] = useState(false)

  return (
    <div className="row">
      <div className="col-md-8 mr-auto ml-auto">
        <h4 className="text-center mb-4">Import existing</h4>

        <ul className="nav nav-tabs d-flex justify-content-center mb-4">
          <li className="nav-item">
            <a className={"nav-link" + (!isMnemonic && (" active") || "")} href="#" onClick={() => setIsMnemonic(false)}>Keystore</a>
          </li>
          <li className="nav-item">
            <a className={"nav-link" + (isMnemonic && (" active") || "")} href="#" onClick={() => setIsMnemonic(true)}>Mnemonic</a>
          </li>
        </ul>

        {isMnemonic ? (
          <ImportMnemonicForm/>
        ):(
          <ImportKeystoreForm/>
        )}

      </div>

    </div>
  )
}
export default ImportScreen

