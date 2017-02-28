'use strict';

var path = require("path");

var Model = {
	getPath: function(folder,filename){
		//console.log(__dirname);
		return path.join(__dirname, folder, filename);
	}
};

module.exports=Model;