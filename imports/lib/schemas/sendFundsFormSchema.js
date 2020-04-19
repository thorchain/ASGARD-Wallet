import SimpleSchema from 'simpl-schema'
import { Tracker } from 'meteor/tracker'
import { BNB } from '/imports/api/wallet'

var bcrypt = require('bcryptjs');

validateAddress = function() {
  const checkKey = this.key === 'sender' ? 'recipient' : 'sender';
      if (this.value === this.field(checkKey).value) {
        return "selfSendTx";
      }
  if (!BNB.bnbClient.checkAddress(this.value, BNB.getPrefix())) { return "invalidBlockchainAddress" }
}

SendFundsFormSchema = new SimpleSchema({
  sender: {
    type: String, // TODO: Add custom valid address check
    label: "Sender",
    custom: validateAddress
  },
	recipient: {
		type: String,
		label: "Recipient",
    custom: validateAddress
	},
	amount: {
		type: Number,
    label: "Amount",
    custom() {
      if (this.value > this.field('maxAmount').value) {
        return "insufficientFunds";
      }
    },
  },
  maxAmount: {
    type: Number,
    label: "Max Amount"
  },
  asset: {
    type: String,
    label: "Asset"
  },
  password: {
    type: String,
    label: "Password",
    custom () {
      if (!bcrypt.compareSync(this.value, this.field('pwHash').value)) {
        return "passwordMismatch";
      }
    }
  },
  pwHash: {
    // Passed in manually, do not send from html form (exposed)
    type: String,
    label: "pwHash"
  }
},{ tracker: Tracker });

export default SendFundsFormSchema