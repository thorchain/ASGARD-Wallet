Schemas = (typeof Schemas === "undefined") ? {} : Schemas;

validateAddress = function() {
  const checkKey = this.key === 'sender' ? 'recipient' : 'sender';
      if (this.value === this.field(checkKey).value) {
        return "selfSendTx";
      }
  if (!BNB.bnbClient.checkAddress(this.value, BNB.getPrefix())) { return "invalidBlockchainAddress" }
}

Schemas.formTransferTx = new SimpleSchema({
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
		label: "Amount"
  },
  asset: {
    type: String,
    label: "Asset"
  },
  password: {
    type: String,
    label: "Password"
  }
},{ tracker: Tracker });
