// dateHelpers.js

Template.registerHelper("moment", function (datetime, param) {
    // Use moment.js to do date formatting
    return datetime && param ? moment(datetime)[param]() : "Never";
});
Template.registerHelper("momentShort", function (datetime, param) {
    const momentShort = require('moment-shortformat')
    // console.log(shortMoment(moment()).short());
    return momentShort(datetime).short()
})

Template.registerHelper("prettyDate", function (isoDate) {
	// TODO: Extend so upport full "pretty date" functionality
    if ( Object.prototype.toString.call(isoDate) === "[object Date]" ) {
      // it is a date
      if ( isNaN( isoDate.getTime() ) ) {
        // date is not valid
      } else {
        // date is valid, no need to do anything
      }
    } else {
      // not a date, assume is UTC string, and make it date
      isoDate = new Date(isoDate);
    }
    
    if (isoDate) {
        var d = isoDate;

        //DAY
        var day = d.getDate();
        if (day < 10) {
            day = "0" + day;
        }
        //Month
        var month = d.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }
        //Year
        var year = d.getFullYear();
        //pull the last two digits of the year
        year = year.toString().substr(2, 2);

        //HOUR
        var hour = d.getHours();
        if (hour < 10) {
            hour = "0" + hour;
        }
        //MINUTE
        var minute = d.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }

        var date = day + "." + month + "." + year + " " + hour + ":" + minute;
        return date;
    }
});
