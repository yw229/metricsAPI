'use strict';

var fs = require("fs");
var path = require("path");
var _ = require("underscore");


var jsonPath = path.join(__dirname, '..', 'models','metrics.json');

var ctrl = require('../controller/metricController.js');

var appRouter = function(app) {

    
    app.post('/measurements',function(req,res){

  		fs.readFile(jsonPath, 'utf8', function(err, data) {
  			if (err) throw err;
            var time = req.body.timestamp,
                temp = req.body.temperature,
                dp = req.body.dewPoint,
                precp = req.body.precipitation;

            var json = JSON.parse(data);

            //Scenario1 : Add a measurement with valid (numeric) values and timestamp
            if (time && ctrl.isValidTimestamp(time) && ctrl.isNumeric(temp) && ctrl.isNumeric(dp) && ctrl.isNumeric(precp)) {
            	var newm = {};
            		newm.timestamp = time;
            		newm.temperature = parseFloat(temp); 
            		newm.dewPoint = parseFloat(dp); 
            		newm.precipitation = parseFloat(precp);
            	json.push(newm);
            	console.log(json);

            	fs.writeFile(jsonPath, JSON.stringify(json), function(err) {
    				if (err) throw err;
    				console.log('The "data to append" was appended to file!');
				});

                res.status(201).send({ "status": "201", "location header ": "/measurements/" + time });
            } 
            else // Scenario 2 and 3: Cannot add a measurement with invalid values or without a timestamp
            {
                res.status(400).send({ 'status': '400' });
            }
        })

    }) ;



    // check route params, if full timestamp, go to /:timestamp, else go /:date
	app.param('timestamp', function(req, res, next, value, name) {
		console.log('param',value);
    	if (!ctrl.isDayOnly(value)) {
        	next();
    	} else {
        	next('route');
    	}
	}) ;


    //Get a specific measurement by timestamp
    app.get("/measurements/:timestamp", function(req, res) {

        fs.readFile(jsonPath, 'utf8', function(err, data) {
            if (err) throw err;
            console.log('time'); 
            var ts = req.params.timestamp,
         		metrics = JSON.parse(data);
            var rt = _.where(metrics,{"timestamp": ts});

            //Scenario 4 : Get a specific measurement
            if(rt.length === 1 ){
            	res.json(rt[0]);
            }
            else if(rt.length === 0 ){ //Scenario 5 : Get a measurement that does not exist
            	res.status(400).send({'status':'400'});
            }
        });
    });

    //Get measurements from a day
    app.get("/measurements/:date", function(req, res) {

        fs.readFile(jsonPath, 'utf8', function(err, data) {
            if (err) throw err;
            
            var dt = req.params.date,
         		metrics = JSON.parse(data);
            var rt =_.filter(metrics, function(e){
            	return ctrl.getDate(e.timestamp) === dt ;
            });

            //Scenario 6 :  Get measurements from a day
            if(rt.length >=1 ){
            	res.json(rt);
            }
            else { //Scenario 7 : Get measurement from a day where no measurements were taken.
            	res.status(400).send({'status':'400'});
            }
        });
    });

    //Update a measurement 
    app.put("/measurements/:timestamp", function(req, res) {

        fs.readFile(jsonPath, 'utf8', function(err, data) {
            if (err) throw err;
            
            var param = req.params.timestamp;
            var time = req.body.timestamp,
    			temp = req.body.temperature,
    			dp = req.body.dewPoint,
    			precp = req.body.precipitation;

         		metrics = JSON.parse(data);
            var rt =_.filter(metrics, function(e){
            	return ctrl.getDate(e.timestamp) === dt ;
            });

            //Scenario 6 :  Get measurements from a day
            if(rt.length >=1 ){
            	res.json(rt);
            }
            else { //Scenario 7 : Get measurement from a day where no measurements were taken.
            	res.status(400).send({'status':'400'});
            }
        });
    });


}

module.exports = appRouter;
