// dataHelpers.js

Template.registerHelper("stellarUnits", function (obj) {
	// body...
	// @arr is the 'balances' array from the stellar account
	var units;
	var admindoc = SystemAdmin.findOne({usage:"appSettings"})
	// for (var i = arr.length - 1; i >= 0; i--) {
		// var obj = arr[i];
		if (obj && obj.asset_type && obj.asset_type === "native") {
			obj.asset_type = "XLM"; 
			return obj
		} else if (obj && !obj.asset_type && obj === "native"){
			// for just field value alone
			return "XLM"
		} else {
			return obj;
		}
	// }
})