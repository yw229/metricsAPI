var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var argv = require('minimist')(process.argv.slice(2));
var port = argv.port || 3000;
var host = argv.host || 'localhost';
var path = require("path");
var jsonPath = path.join(__dirname, 'models','metrics.json');
var statsPath = path.join(__dirname, 'models','statistics.json');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


require("./routes/routes.js")(app,jsonPath,statsPath);
http.createServer(app);

 
var a = app.listen(port, host, function () {
    console.log("Listening on host %s,port %s...",host,port);
});

module.exports=a;
