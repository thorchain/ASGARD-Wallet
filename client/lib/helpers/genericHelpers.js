// From https://github.com/robertdavid010/meteor_boilerplate/tree/master/client/lib/helpers

// This is a file for global scripts

/* ********************************************** */
/* General Helpers ****************************** */

Template.registerHelper("parseInt", function (string) {
	if (typeof string === "string") {
		// THis is untested workaround for data records
		// which contain string type of numeric data
		// return string.split(" ").[0].parseInt();
	}
});

Template.registerHelper("consoleLog", function (object) {
	// function getErrorObject(){
	// 	try { throw Error('') } catch(err) { return err; }
	// }
	// var err = getErrorObject();
	// var caller_line = err.stack.split("\n")[4];
	// var index = caller_line.indexOf("at ");
	// var clean = caller_line.slice(index+2, caller_line.length);

	// var caller_line = (new Error).stack.split("\n")[4];
	// var caller = (new Error).stack.split("\n");
	// console.log("trying error lines...");
	// // template.home
	// var res = caller.filter(e => {
	// 	return e.startsWith('template.') && e.charAt((e.indexOf('.') + 1) !== "_");
	// })
	// console.log(res);
	
	
	
    console.log(object);
});

Template.registerHelper("getVat", function (value) {
    return (value * 1.25) * 0.19;
});

Template.registerHelper("toArray", function (obj, name) {
	// This takes an object and makes it into an array
	if (typeof obj === "object") {
		var theArr = [];
		for (var i in obj) {
			var o = {};
			var e = obj[i];
			o.name = i;
			o.value = e;

			// e[name] = i;

			theArr.push(e);
			theArr.push(o);
		}
		return theArr;
	}
});

Template.registerHelper("toJSON", function (object) {
  return object ? JSON.stringify(object, null, 2) : null;
});

Template.registerHelper("toUpper", function (string) {
  return string ? string.toUpperCase() : null;
});

Template.registerHelper("toLower", function (string) {
  return string ? string.toLowerCase() : null;
});

Template.registerHelper("toCapitals", function (string) {
	return string ? string.charAt(0).toUpperCase() + string.slice(1) : null;
});

Template.registerHelper("toSingular", function (string) {
	if (string) {
		return string.substr(0, string.length - 1);
	};
});

Template.registerHelper("prettyText", function (string) {
	if (string) {
		return string.replace(/\r?\n/g, '<br />');
	};
});

Template.registerHelper("concat", function (str1, str2) {
	if (typeof str1 === "string" && typeof str2 === "string") {
		return str1.concat(str2);
	} else {
		console.error("missing attributin in cocat() call");
	}
})

Template.registerHelper("prettyNum", function (num) {
	if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + " B";
  }
  else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + " M";
  }
  else if (num >= 1000) {
      return (num / 1000).toFixed(1) + " k";
  }
  else if (!num || num <= 0) {
  	return 0;
  }
  else {
      return num;
  }
});


Template.registerHelper("getCount", function (obj) {
	if (obj) {
		if (typeof obj !== "object") {
			// Assumes string/array type
			return obj.length;
		} else {
			return Object.keys(obj).length
		};
	} else {
		return 0;
	};
});

Template.registerHelper("getKey", function (item) {
	return Object.keys(item)[0];
});

Template.registerHelper("getVal", function (item) {
	return item[Object.keys(item)[0]];
});

Template.registerHelper("ADD", function (v1, v2) {
	if (typeof v1 === "number" && typeof v2 === "number") {
		return v1 + v2;
	};
});

Template.registerHelper("SUB", function(v1, v2) {
	if (typeof v1 === "number" && typeof v2 === "number") {
		return v1 - v2;
	};
});

Template.registerHelper("toBase1", function (num) {
	num++;
	return num;
});

Template.registerHelper("toBase0", function (num) {
	num--;
	return num;
});

Template.registerHelper("toCurrency", function (num) {
	if (typeof num === "number") {

		num = Math.round(num * 100);
    var len = num.toString().length;

    if (num !== 0) {
		  num = (num / 100).toPrecision(len);
    } else {
    	num = "0.00";
    }
    return num;
	} else {
		return "0.00";
	}
});

Template.registerHelper("addCommasNum", function (nStr) {
	nStr += ''; // Convert to string
  var x = nStr.split('.'); // Split dollars and cents
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/; // regex stmnt
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2'); // Add commas
  }
  return x1 + x2; // Join together for final num as string
});

Template.registerHelper("encodeURIComponent", function (str) {
	return encodeURIComponent(str);
});

Template.registerHelper("decodeURIComponent", function (str) {
	return decodeURIComponent(str);
});


Template.registerHelper("getUrlifiedText", function (text) {
    //Detects all URLS in text and makes them a hyperlink
    var urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
    return text.replace(urlRegex, function(url) {
        if (url.startsWith("http://"|| url.startsWith("http://"))) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        }
        else if (url.startsWith("https://"|| url.startsWith("https://"))) {
            return '<a href="' + url + '" target="_blank">' + url + '</a>';
        }
        else
        {
            return '<a href="' + "http://"+url + '" target="_blank">' + url + '</a>';
        }

    })

});

Template.registerHelper("getUrlRoot", function (url) {
    //find & remove protocol (http, ftp, etc.) and get domain root
    // for use in class and parameter specifications etc.
	if (url) {

	    var domain;
	    if (url.indexOf("://") > -1) {
	        domain = url.split("/")[2];
	    }
	    else {
	        domain = url.split("/")[0];
	    }

	    //find & remove port number
	    domain = domain.split(":")[0];

	    // remove subdomains and tld's
	    // var dots = domain.split(".");
    	// domain = dots[dots.length - 2]

	    return domain;

	};

});

Template.registerHelper("reactiveRouteOption", function (string) {
    FlowRouter.watchPathChange();
    return FlowRouter.current().route.options[string];
});

Template.registerHelper('formatId', function (data) {
    return (data && data._str) || data;
});

Template.registerHelper("Schemas", function () {
	return Schemas;
});

Template.registerHelper("Session", function (param) {
	return Session.get(param);
})

Template.registerHelper("Settings", function (param) {
	return Meteor.settings.public[param];
})

Template.registerHelper("web3", function () {
	return window.web3 ? window.web3 : false;
})


