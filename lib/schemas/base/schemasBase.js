// schemasBase.js

import {SS2} from './imports/SS2.js';
SimpleSchema = SS2;
SimpleSchema.extendOptions(['autoform']);
SimpleSchema.debug = true;
// Global schemas object
Schemas = (typeof Schemas === "undefined") ? {} : Schemas;


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

Schemas.baseSchema = new SimpleSchema({

	createdAt: {
		type: Date,
		autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset(); // Prevent user from supplying their own value
      }
    }
	},

	updatedAt: {
		type: Date,
    autoValue: function() {
    	// if (!this.value) {
	      return new Date();
    	// } else {
    		// return this.value;
    	// }
    }
	},
	// Note: Uncomment this when after adding users accounts
	// createdBy: {
	// 	type: String,
	// 	autoValue: function () {
	// 		if (this.isInsert) {
	// 			// Allows base schema autovalue override for use in user config setup, prior to this.userId being available
	// 			// TODO: Improve this logic. It is not fully correct
	// 			return (Meteor.isServer && !this.userId) ? this.value : this.userId;
	// 		}
	// 	}
	// }

});