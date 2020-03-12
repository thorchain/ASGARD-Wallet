import SimpleSchema from 'simpl-schema'
// import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Tracker } from 'meteor/tracker'
import { BNB } from '/imports/api/wallet'
import { UserAssets } from '/imports/api/collections/client_collections'

var bcrypt = require('bcryptjs');

validateAddress = function() {
  const checkKey = this.key === 'sender' ? 'recipient' : 'sender';
      if (this.value === this.field(checkKey).value) {
        return "selfSendTx";
      }
  if (!BNB.bnbClient.checkAddress(this.value, BNB.getPrefix())) { return "invalidBlockchainAddress" }
}

const FreezeFundsFormSchema = new SimpleSchema({
  sender: {
    type: String, // TODO: Add custom valid address check
    label: "Sender",
    custom: validateAddress
  },
	amount: {
		type: Number,
    label: "Amount",
    custom() {
      if (this.value > this.field('maxAmount').value) {
        return "insufficientFunds"
      }
      // TODO: Enable below
      // if (BNB.getFee('tokensFreeze') < UserAssets.findOne({symbol:this.field('asset').value})) {
      //   return "insufficientFeeFunds"
      // }
    }
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
        return "passwordError";
      }
    }
  },
  pwHash: {
    // Passed in manual validation, do not send from html form
    type: String,
    label: "pwHash"
  }
},{ tracker: Tracker });

// For uniforms, export this
// const bridge = new SimpleSchema2Bridge(FreezeFundsSchema);

export default FreezeFundsFormSchema