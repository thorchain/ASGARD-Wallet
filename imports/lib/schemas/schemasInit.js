import SimpleSchema from 'simpl-schema'

SimpleSchema.extendOptions(['uniform']);
SimpleSchema.debug = true;

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

// TODO: Add method to get field name/types to use for typescript types
// This is not quite right... extend the SimplSchema class instead
// Inteded outcome is Myschema.getTypes()... OR maybe not...
// SimpleSchema.getTypes = (schema) => {
	// console.log("make this method return field names with types")
	// https://stackoverflow.com/questions/45771307/typescript-dynamically-create-interface/45777530
// }