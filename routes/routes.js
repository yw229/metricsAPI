'use strict';

var fs = require("fs");
var path = require("path");
var _ = require("underscore");

var jsonPath = path.join(__dirname, '..', 'models','metrics.json');
var statsPath = path.join(__dirname, '..', 'models','statistics.json');
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
            var existed = _.where(json,{"timestamp": time}); //check if timestamp existed 

            //Scenario1 : Add a measurement with valid (numeric) values and timestamp
            if (existed.length ===0){
                if ( time && ctrl.isValidTimestamp(time) && ctrl.isNumeric(temp) && ctrl.isNumeric(dp) && ctrl.isNumeric(precp)) {
                    var newm = {};
                        newm.timestamp = time;
                        newm.temperature = parseFloat(temp); 
                        newm.dewPoint = parseFloat(dp); 
                        newm.precipitation = parseFloat(precp);
                    json.push(newm);
                    //console.log(json);

                    fs.writeFile(jsonPath, JSON.stringify(json), function(err) {
                        if (err) throw err;
                        console.log('The "data to append" was appended to file!');
                        res.header('Location', "/measurements/" + time);
                        res.status(201).send({ "status": "201", "Location": "/measurements/" + time });
                    });
                }
                else  // Scenario 2: Cannot add a measurement with invalid values
                    if( !ctrl.isNumeric(temp) || ! ctrl.isNumeric(dp) || ! ctrl.isNumeric(precp) ){
                        res.status(400).send({ 'status': '400','error':'invalid values'});
                    }
                else //Scenario 3: Cannot add a measurement without a timestamp
                    if(!time || ctrl.isValidTimestamp(time)){ 
                        res.status(400).send({ 'status': '400','error':'missing or invalid timestamp '});
                    }
            }
            else // 
            {
                res.status(400).send({ 'status': '400','error':time+' already existed'});
            }
        })

    }) ;



    // check route params, if full timestamp, go to /:timestamp, else go /:date
	app.param('timestamp', function(req, res, next, value, name) {
		//console.log('param',value);
    	if (ctrl.isValidTimestamp(value)) {
        	next();
    	} else if(ctrl.isDayOnly(value)){
        	next('route');
    	}
        else{
            res.status(400).send({ 'status': '400','error':'invalid date in request parameter '});
        }
	}) ;


    //Get a specific measurement by timestamp
    app.get("/measurements/:timestamp", function(req, res) {

        fs.readFile(jsonPath, 'utf8', function(err, data) {
            if (err) throw err;
            //console.log('time'); 
            var ts = req.params.timestamp,
         		metrics = JSON.parse(data);
            var rt = _.where(metrics,{"timestamp": ts});
            //console.log(rt);
            //Scenario 4 : Get a specific measurement
            if(rt.length === 1 ){
            	res.json(rt[0]);
            }
            else if(rt.length === 0 ){ //Scenario 5 : Get a measurement that does not exist
            	res.status(404).send({'status':'404','error':'measurement does not exist'});
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
            	res.status(404).send({'status':'404'});
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
         	var metrics = JSON.parse(data),
                existed = _.where(metrics,{"timestamp": param}), //check if timestamp existed 
                updated ={};
         	//console.log('put',param,time,existed);
            
            //measurement exists 
            if(existed.length===1){
                //Scenario8: Replace a measurement with valid (numeric) values
                if( param === time && ctrl.isNumeric(temp) && ctrl.isNumeric(dp) && ctrl.isNumeric(precp)){
                    _.each(metrics, function(obj){
                            _.each(obj, function(v,k){
                            if( v === param){
                                //console.log(obj);
                                obj.temperature = parseFloat(temp);
                                obj.dewPoint = parseFloat(dp) ;
                                obj.precipitation = parseFloat(precp);
                                updated = obj ; 
                            }
                        })
                    });
                    fs.writeFile(jsonPath, JSON.stringify(metrics), function(err) {
                            if (err) throw err;
                            console.log('The "data to replace" was updated to file!');
                            res.status(204).send({ "status": "204", "updated measurement": updated });
                    });
                }
                else //Scenario9: Replace a measurement with invalid values
                    if (param === time &&(!ctrl.isNumeric(temp) || ! ctrl.isNumeric(dp) || ! ctrl.isNumeric(precp))){ 
                        res.status(400).send({ "status": "400","measurement": existed[0]});
                } 
                else //Scenario 10 : Replace a measurement with mismatched timestamps
                    if ( param !== time){
                        res.status(409).send({ "status": "409", "measurement": existed[0]});
                    }     
            }
            else  // Scenario11: Replace a measurement that does not exist
                if( existed.length===0){
                    res.status(404).send({ "status": "404" ,"error":"measurement does not exist"});
                }
        });
    });

    //Update measurement partially
    app.patch("/measurements/:timestamp", function(req, res) {

        fs.readFile(jsonPath, 'utf8', function(err, data) {
            if (err) throw err;
            
            var param = req.params.timestamp;
            var time = req.body.timestamp,
                temp = req.body.temperature,
                dp = req.body.dewPoint,
                precp = req.body.precipitation;
            var metrics = JSON.parse(data),
                existed = _.where(metrics,{"timestamp": param}), //check if timestamp existed 
                updated ={};
            console.log('patch',param,time,temp,dp,precp,existed);
            
            //measurement exists 
            if(existed.length===1){
                    if(param === time){
                        //Scenario 13 : Update metrics of a measurement with invalid values
                        if( (temp&&!ctrl.isNumeric(temp)) || (dp&&!ctrl.isNumeric(dp)) || (precp&&!ctrl.isNumeric(precp))){
                                res.status(400).send({ "status": "400","measurement": existed[0]});
                            }
                        else
                        //Scenario12: update a measurement with valid (numeric) values
                        {
                            _.each(metrics, function(obj){
                                    _.each(obj, function(v,k){
                                    if( v === param){
                                        if ( temp && ctrl.isNumeric(temp))
                                            obj.temperature = parseFloat(temp);
                                        if ( dp && ctrl.isNumeric(dp))
                                            obj.dewPoint = parseFloat(dp) ;
                                        if ( precp && ctrl.isNumeric(precp))
                                            obj.precipitation = parseFloat(precp);
                                        updated = obj ; 
                                    }
                                })
                            });
                            console.log('updated',updated);
                            fs.writeFile(jsonPath, JSON.stringify(metrics), function(err) {
                                if (err) throw err;
                                console.log('The "data to update" was updated to file!');
                                res.status(204).send({ "status": "204", "updated measurement": updated });
                            });
                        }
                        
                }
                else{ //Scenario 14: Update metrics of a measurement with mismatched timestamps
                    res.status(409).send({ "status": "409", "measurement": existed[0] });
                }
                
            }
            else  // Scenario 15 : Update a measurement that does not exist
                if( existed.length===0){
                    res.status(404).send({ "status": "404" ,"error":"measurement does not exist"});
                }
        });
    });

    //Delete a measurement 
    app.delete("/measurements/:timestamp", function(req, res) {

        fs.readFile(jsonPath, 'utf8', function(err, data) {
            if (err) throw err;
            
            var param = req.params.timestamp;
            var time = req.body.timestamp,
                temp = req.body.temperature,
                dp = req.body.dewPoint,
                precp = req.body.precipitation;
            var metrics = JSON.parse(data),
                existed = _.where(metrics,{"timestamp": param}), //check if timestamp existed 
                deleted = {};
            console.log('delete',param,time,existed);
            
            //measurement exists 
            if(existed.length===1){ //Scenario16 :  Delete a specific measurement
                
                var rest = _.filter(metrics, function(e){
                    return e.timestamp !== param ;
                });
                deleted = existed;
                //console.log(deleted, rest) ; 
                fs.writeFile(jsonPath, JSON.stringify(rest), function(err) {
                        if (err) throw err;
                        console.log('The "data to delete" was updated to file!');
                        res.status(204).send({ "status": "204",'deleted measurement':deleted});
                    });
                } 
            else  // Scenario17: Delete a measurement that does not exist
                if( existed.length===0){
                    res.status(404).send({ "status": "404" ,"error":"measurement for "+param+" does not exist","measurements":metrics});
                }
        });
    });

    //Get measurement statistics
    app.get("/stat", function(req, res) {

        fs.readFile(statsPath, 'utf8', function(err, data) {
            if (err) throw err;

            var st = req.query.stat,
                metr = req.query.metric,
                from = req.query.fromDateTime ,
                to = req.query.toDateTime,
                json = JSON.parse(data);
            var ret = [];
            
            typeof st ==='string' ? st =[st] : st ;
            typeof metr ==='string' ? metr = [metr]:metr ; 
            //console.log( st, metr,from,to); 

            var fltime = _.filter(json, function(e){
                return e.timestamp>=from&&e.timestamp<to;
            });
             //console.log('fltime',fltime);
            //Scenario: Get stats for more than one metric
            _.each(metr,function(m){
                    //Scenario: Get stats for a sparsely reported metric
                    var filt = _.filter(fltime,function(f){
                        //console.log(m,f);
                        return (m in f) && f[m] !=="" && f[m]!==undefined &&f[m]!==null ;
                    });
                    var min ={}, max ={}; 
                    //console.log('filt',filt);
                    //Get stats for a well-reported metric
                    if(filt.length>0){ //filter out metric not reported 
                            _.each(st,function(s){
                            if(s==='min'){
                                min = _.min(filt, _.property(m));
                                ret.push({'metric':m,'stat':s,'value':min[m]});
                            }else if(s === 'max'){
                                max = _.max(filt, _.property(m));
                                ret.push({'metric':m,'stat':s,'value':max[m]});
                            }
                            else if(s ==='average' && min && max){
                                ret.push({'metric':m,'stat':s,'value':(min[m]+max[m])/2});
                            }
                        })

                    }                   

            });
            
            if(ret.length >0 ){
                res.status(200).json(ret);
            }
            else{ //Get stats for a metric that has never been reported
                res.status(200).send(ret);
            }           
        });
    });

}

module.exports = appRouter;
