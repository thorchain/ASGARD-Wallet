import './walletReceive.html'

if (Meteor.isClient) {
  import Clipboard from 'clipboard'
  import QRCode from 'qrcode'

  Template.walletReceive.onCreated(function () {
    const self = this
    self.copyMsg = new ReactiveVar()
  });

  Template.walletReceive.onRendered(function() {
    const self = this

    const addr = UserAccount.findOne().address
    QRCode.toCanvas(addr, { errorCorrectionLevel: 'H' }, function (err, canvas) {
      if (err) throw err
      const container = document.getElementById('qr-container')
      container.appendChild(canvas)
    })

    const clipboard = new Clipboard('#clipboard-btn');
    let timer = null
    clipboard.on('success', (e) => {
      if (timer !== null) {
        clearTimeout(timer)
        self.copyMsg.set(null)
      }
      self.copyMsg.set('Address copied...')
      timer = setTimeout(() => {
        self.copyMsg.set(null)
      }, 3000);
      e.clearSelection();
    });

    clipboard.on('error', function (e) {
      console.log('error copying to clipboard');
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });

  })

  Template.walletReceive.helpers({
    account: function () {
      return UserAccount.findOne()
    },
    copyMsg: function () {
      return Template.instance().copyMsg.get()
    }
  });

  Template.walletReceive.events({
    "click [data-event='copyAddress']": function (event, self) {
      event.preventDefault()
      // const input = $("#copy-address")
      // console.log("copying text");
      // const copyText = document.getElementById("address-text")
      /* Select the text field */
      // copyText.select();
      // copyText.setSelectionRange(0, 99999); /*For mobile devices*/
      // $(input).focus();
      // $(input).select();
      // document.execCommand('copy');
      // $(input).after("Copied to clipboard");

      /* Copy the text inside the text field */
      // after the text is selected
      // document.execCommand("copy");
      // $('input').click(function() {
      // });
      
    }
  })
}