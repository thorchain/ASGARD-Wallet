import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['uniform']);
SimpleSchema.debug = true;

console.log("initializing SimpleSchema?");

SimpleSchema.setDefaultMessages({
	messages: {
		en: {
			"emailExists": "Email already registered",
			"passwordMismatch": "Passwords do not match",
			"passwordError": "Incorrect password",
			"acceptTerms": "Please accept terms",
      "authError": "Error, please check credentials",
      "invalidBlockchainAddress": "Invalid address",
			"invalidMnemonic": "Invalid phrase",
			"incompleteMnemonic": "Incomplete phrase",
			"invalidKeystore": "Invalid keystore",
			"noKeystore": "No keystore in file",
			"selfSendTx": "Invalid recipient (self)",
			"insufficientFunds": "Insufficient Funds",
			"insufficientFeeFunds": "Insufficient Fee Funds [BNB]"
		},
	},
});