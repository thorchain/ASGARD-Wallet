// schemasBase.js
// import SimpleSchema from 'simpl-schema'
// import { Tracker } from 'meteor/tracker'


// export const BaseSchema = new SimpleSchema({

// 	createdAt: {
// 		type: Date,
// 		autoValue: function() {
//       if (this.isInsert) {
//         return new Date();
//       } else if (this.isUpsert) {
//         return {$setOnInsert: new Date()};
//       } else {
//         this.unset(); // Prevent user from supplying their own value
//       }
//     }
// 	},

// 	updatedAt: {
// 		type: Date,
//     autoValue: function() {
//     	// if (!this.value) {
// 	      return new Date();
//     	// } else {
//     		// return this.value;
//     	// }
//     }
// 	},
// 	// Note: Uncomment this when after adding users accounts
// 	// createdBy: {
// 	// 	type: String,
// 	// 	autoValue: function () {
// 	// 		if (this.isInsert) {
// 	// 			// Allows base schema autovalue override for use in user config setup, prior to this.userId being available
// 	// 			// TODO: Improve this logic. It is not fully correct
// 	// 			return (Meteor.isServer && !this.userId) ? this.value : this.userId;
// 	// 		}
// 	// 	}
// 	// }

// });