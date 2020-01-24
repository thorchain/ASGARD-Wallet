
if (Meteor.isClient) {

import QRCode from 'qrcode'

  Template.walletReceive.onRendered(function() {
    const addr = UserAccount.findOne().address
    QRCode.toCanvas(addr, { errorCorrectionLevel: 'H' }, function (err, canvas) {
      if (err) throw err
    
      var container = document.getElementById('qr-container')
      container.appendChild(canvas)
    })

  })

  Template.walletReceive.helpers({
    account: function () {
      return UserAccount.findOne()
    }
  });
}