'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var argv = require('minimist')(process.argv.slice(2));
var port = argv.port || 3000;
var host = argv.host || 'localhost';
var mod = require('./models/model.js');
var jsonPath,statsPath;


if (process.env.NODE_ENV === 'dev') {
    jsonPath = mod.getPath('/','metrics.json');
    statsPath = mod.getPath('/','statistics.json');
} else if (process.env.NODE_ENV === 'test') {
    jsonPath = mod.getPath('../models','test.metrics.json');
    statsPath = mod.getPath('../models','test.statistics.json');
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


require("./routes/routes.js")(app,jsonPath,statsPath);
http.createServer(app);

 
var a = app.listen(port, host, function () {
    console.log("Listening on host %s,port %s...",host,port,process.env.NODE_ENV,jsonPath);
});


module.exports=a;

