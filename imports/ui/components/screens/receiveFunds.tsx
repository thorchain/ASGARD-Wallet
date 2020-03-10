import React, { useEffect, useState } from "react"
import { useTracker } from 'meteor/react-meteor-data'
import { UserAccountTypes } from '/imports/api/collections/UserAccountCollection'
import { UserAccount } from '/imports/api/collections/client_collections'

import Clipboard from 'clipboard'
import QRCode from 'qrcode'

const RecieveFundsScreen: React.FC = (): JSX.Element => {
  const [copyMsg, setCopyMsg] = useState<string>('')
  const userAccount: UserAccountTypes = useTracker(() => {
    return UserAccount.findOne()
  })
  useEffect(() => {
    QRCode.toCanvas(userAccount.address, { errorCorrectionLevel: 'H' }, function (err: any, canvas: any) {
      if (err) throw err
      const container = document.getElementById('qr-container')
      container && container.appendChild(canvas)
    })

    const clipboard = new Clipboard('#clipboard-btn');
    let timer: any
    clipboard.on('success', (e: any) => {
      if (timer !== null) {
        clearTimeout(timer)
        setCopyMsg('')
      }
      setCopyMsg('Address copied...')
      timer = setTimeout(() => {
        setCopyMsg('')
      }, 3000);
      e.clearSelection();
    });

    clipboard.on('error', function (e: any) {
      // Verbose logging since an extreme edge case(?)
      console.log('error copying to clipboard');
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });
  },[UserAccount])
  
  return (
    <div className="row">
      <h5 className="col-12 text-center mb-4">Receive Funds</h5>

      <div className="col-md-8 mx-auto">

        <div className="card mt-3 border-0">
          <div className="card-body text-center">

            <div className="rounded d-inline-block mx-auto mb-3" id="qr-container"></div>

          </div>
        </div>


      </div>

      <div className="form-group col-md-8 mx-auto text-center">

        <label htmlFor="clipboard-btn" className="d-block">
          <div className="text-truncate text-monospace">{userAccount.address}</div>
        </label>
        <button type='button' id="clipboard-btn" className="btn btn-primary my-4 px-5" data-clipboard-text={userAccount.address} aria-describedby="copyBtnHelp">
          Copy&nbsp;<i className="fa fa-copy"></i>
        </button>
        <small id="copyBtnHelp" className="form-text text-muted text-centered w-100 col-m-correct">{copyMsg}</small>

      </div>

    </div>

  )
}

export default RecieveFundsScreen
