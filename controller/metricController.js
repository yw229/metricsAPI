'use strict'


var moment = require("moment");


var mCtrl = {
    isNumeric: function(v) { //validate if the post params value are numeric 
        return !isNaN(parseFloat(v)) && isFinite(v);
    },
    isValidTimestamp: function(t){ //
    	return moment(t, moment.ISO_8601).isValid();
    },
    getDate: function(t){ // extract year-month-date 
    	return moment(t).format('YYYY-MM-DD');
    },
    isDayOnly: function(t){ // check if params of timestamp or day route 
    	return t === moment(t).format('YYYY-MM-DD') ; 
    }

};




module.exports = mCtrl;
