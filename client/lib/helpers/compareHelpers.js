// evalHelpers.js


Template.registerHelper("isZero", function (num) {
	return (num === 0) ? true : false; 
});

Template.registerHelper("not", function (bool) {
	return !bool; 
});

Template.registerHelper("eq", function (v1, v2, options) {
	return (v1 === v2) ? true : false; 
});

Template.registerHelper("ne", function (v1, v2, options) {
	return (v1 !== v2) ? true : false; 
});

Template.registerHelper("lt", function (v1, v2, options) {
	return (v1 < v2) ? true : false; 
});

Template.registerHelper("gt", function (v1, v2, options) {
	return (v1 > v2) ? true : false; 
});

Template.registerHelper("lte", function (v1, v2, options) {
	return (v1 <= v2) ? true : false; 
});

Template.registerHelper("gte", function (v1, v2, options) {
	return (v1 >= v2) ? true : false; 
});

Template.registerHelper("in", function (v1, v2, options) {
	if (typeof v1 === "string" && typeof v2 === "string") {
		var a = v1.toLowerCase();
		var b = v2.toLowerCase();
		return (a.indexOf(b) !== -1 || b.indexOf(a) !== -1) ? true : false; 
	} else {
		return false;
	};
});

Template.registerHelper("OR", function (v1, v2, options) {
	return (v1 || v2) ? true : false;
});

Template.registerHelper("AND", function (v1, v2, options) {
	return (v1 && v2) ? true : false;
});