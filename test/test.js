'use strict';

var should = require("should");
var request = require("supertest");
var url = require('url');
var app = require('../server.js');
var agent = request.agent(app);  

describe('server response', function () {
  before(function () {
    app.listen(3000);
  });

  after(function () {
    app.close();
  });
});


// UNIT test begin

describe("metrics unit test", function() {
	//POST unit test
    it("Add a measurement with valid (numeric) values", function(done) {	
            agent.post("/measurements")
            .send({
        		"timestamp": "2015-09-01T16:24:00.000Z",
        		"temperature": 27.1,
        		"dewPoint": 16.7,
        		"precipitation": 0
    		})
            .expect("Content-type", /json/)
            .expect('Location', "/measurements/2015-09-01T16:24:00.000Z")
            .expect(201) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 201
                res.status.should.equal(201);
                // HTTP header should has location and value is the sent timestamp
                res.header.location.should.equal("/measurements/2015-09-01T16:24:00.000Z");
                res.header['content-type'].should.equal("application/json; charset=utf-8");
                done();
            });
    });

    it("Cannot add a measurement with invalid values", function(done) {	
            agent.post("/measurements")
            .send({
        		"timestamp": "2015-09-01T15:24:00.000Z",
        		"temperature": "not a number",
        		"dewPoint": 16.7,
        		"precipitation": 'none'
    		})
            .expect(400) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 400
                res.status.should.equal(400);
                done();
            });
    });

    it("Cannot add a measurement without a timestamp", function(done) {	
            agent.post("/measurements")
            .send({
        		"temperature": 27.1 ,
        		"dewPoint": 20 ,
        		"precipitation": 0
    		})
            .expect(400) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 400
                res.status.should.equal(400);
                done();
            });
    });

    // GET unit test 
    it(" Get a specific measurement", function(done) {	
            agent.get("/measurements/"+"2015-09-01T16:20:00.000Z")
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(200);
                res.body.timestamp.should.equal('2015-09-01T16:20:00.000Z');
                res.body.temperature.should.equal(27.5);
                res.body.dewPoint.should.equal(17.1);
                res.body.precipitation.should.equal(0);
                done();
            });
    });

    it("Get a measurement that does not exist", function(done) {	
            agent.get("/measurements/"+"2015-09-01T16:50:00.000Z")
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 404
                res.status.should.equal(404);
                done();
            });
    });

    it("Get measurements from a day", function(done) {	
            agent.get("/measurements/"+"2015-09-01")
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(200);
                res.body.should.be.instanceof(Array).and.have.lengthOf(6);
                res.body.should.eql([
                          {
                            "timestamp": "2015-09-01T16:00:00.000Z",
                            "temperature": 27.1,
                            "dewPoint": 16.7,
                            "precipitation": 15.2
                          },
                          {
                            "timestamp": "2015-09-01T16:10:00.000Z",
                            "temperature": 27.3,
                            "dewPoint": 16.9,
                            "precipitation": 0
                          },
                          {
                            "timestamp": "2015-09-01T16:20:00.000Z",
                            "temperature": 27.5,
                            "dewPoint": 17.1,
                            "precipitation": 0
                          },
                          {
                            "timestamp": "2015-09-01T16:30:00.000Z",
                            "temperature": 27.4,
                            "dewPoint": 17.3,
                            "precipitation": 12.3
                          },
                          {
                            "timestamp": "2015-09-01T16:40:00.000Z",
                            "temperature": 27.2,
                            "dewPoint": 17.2,
                            "precipitation": 0
                          },
                          {
                            "timestamp": "2015-09-01T16:24:00.000Z",
                            "temperature": 27.1,
                            "dewPoint": 16.7,
                            "precipitation": 0
                          }
                ]);
                done();
            });
    });

    it("Get measurements from a day where no measurements were taken", function(done) {	
            agent.get("/measurements/"+"2015-09-03")
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 404
                res.status.should.equal(404);
                done();
            });
    });

   	//PUT unit test 
   	it("Replace a measurement with valid (numeric) values", function(done) {	
            agent.put("/measurements/"+"2015-09-01T16:00:00.000Z")
            .send({
        		"timestamp": "2015-09-01T16:00:00.000Z",
        		"temperature":  27.1 ,
        		"dewPoint": 16.7,
        		"precipitation": 15.2 
    		})
            .expect(204) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 204
                res.status.should.equal(204);
                done();
            });
    });

    it(" Replace a measurement with invalid values", function(done) {	
            agent.put("/measurements/"+"2015-09-01T16:00:00.000Z")
            .send({
        		"timestamp": "2015-09-01T16:00:00.000Z",
        		"temperature":   "not a number"  ,
        		"dewPoint": "not a number" ,
        		"precipitation": 0
    		})
            .expect(400) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be  400
                res.status.should.equal(400);
                //console.log(res.body);
                res.body.measurement.timestamp.should.equal('2015-09-01T16:00:00.000Z');
                res.body.measurement.temperature.should.equal(27.1);
                res.body.measurement.dewPoint.should.equal(16.7);
                res.body.measurement.precipitation.should.equal(15.2);
                done();
            });
    });

    it("Replace a measurement with mismatched timestamps", function(done) {	
            agent.put("/measurements/"+"2015-09-01T16:10:00.000Z")
            .send({
        		"timestamp": "2015-09-02T16:10:00.000Z",
        		"temperature":  27.3 ,
        		"dewPoint":   16.9  ,
        		"precipitation": 15.2 
    		})
            .expect(409) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be  409
                res.status.should.equal(409);
                res.body.measurement.timestamp.should.equal('2015-09-01T16:10:00.000Z');
                res.body.measurement.temperature.should.equal(27.3);
                res.body.measurement.dewPoint.should.equal(16.9);
                res.body.measurement.precipitation.should.equal(0);
                done();
            });
    });

    it("Replace a measurement that does not exist", function(done) {	
            agent.put("/measurements/"+"2015-09-03T16:00:00.000Z")
            .send({
        		"timestamp": "2015-09-03T16:00:00.000Z",
        		"temperature":  27.1 ,
        		"dewPoint":   16.7  ,
        		"precipitation": 15.2 
    		})
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be  404
                res.status.should.equal(404);
                done();
            });
    });

    //PATCH unit test 
    it(" Update metrics of a measurement with valid (numeric) values", function(done) {	
            agent.patch("/measurements/"+"2015-09-01T16:30:00.000Z")
            .send({
            	"timestamp": "2015-09-01T16:30:00.000Z",
        		"precipitation":  12.3 ,
    		})
            .expect(204) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 204
                res.status.should.equal(204);
                done();
            });
    });

    it(" Update metrics of a measurement with invalid values", function(done) {	
            agent.patch("/measurements/"+"2015-09-01T16:40:00.000Z")
            .send({
            	"timestamp": "2015-09-01T16:40:00.000Z",
        		"precipitation":  "not a number" ,
    		})
            .expect(400) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 400
                res.status.should.equal(400);
                res.body.measurement.timestamp.should.equal('2015-09-01T16:40:00.000Z');
                res.body.measurement.temperature.should.equal(27.2);
                res.body.measurement.dewPoint.should.equal(17.2);
                res.body.measurement.precipitation.should.equal(0);
                done();
            });
    });

    it(" Update metrics of a measurement with mismatched timestamps", function(done) {	
            agent.patch("/measurements/"+"2015-09-01T16:40:00.000Z")
            .send({
            	"timestamp": "2015-09-02T16:40:00.000Z",
        		"precipitation": 12.3
    		})
            .expect(409) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 409
                res.status.should.equal(409);
                res.body.measurement.timestamp.should.equal('2015-09-01T16:40:00.000Z');
                res.body.measurement.temperature.should.equal(27.2);
                res.body.measurement.dewPoint.should.equal(17.2);
                res.body.measurement.precipitation.should.equal(0);
                done();
            });
    });

    it("Update metrics of a measurement that does not exist", function(done) {	
            agent.patch("/measurements/"+"2015-09-02T16:40:00.000Z")
            .send({
            	"timestamp": "2015-09-02T16:40:00.000Z",
        		"precipitation": 12.3
    		})
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 404
                res.status.should.equal(404);
                done();
            });
    });

    //DELETE unit test 
    it("Delete a specific measurement", function(done) {	
            agent.delete("/measurements/"+"2015-09-01T16:24:00.000Z") // pick the test which I added at first place
            .expect(204) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 204
                res.status.should.equal(204);
                done();
            });
    });

    it("Delete a measurement that does not exist", function(done) {	
            agent.delete("/measurements/"+"2015-09-01T16:24:00.000Z") // pick the above test which I just deleted 
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 404
                res.status.should.equal(404);
                done();
            });
    });

    // Get measurement statistics Unit Test 
    it(" Get stats for a well-reported metric", function(done) {
    		var unit = "/stat?stat=min&stat=max&stat=average&fromDateTime=2015-09-01T16:00:00.000Z&toDateTime=2015-09-01T17:00:00.000Z&metric=temperature";
    		var queryParams = url.parse(unit, true);	
            var stat = queryParams.query.stat,
            	from = queryParams.query.fromDateTime,
            	to = queryParams.query.toDateTime,
            	metric = queryParams.query.metric;
        	//console.log(stat,from,to,metric);
            agent.get(unit)
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(200);
                res.body.should.be.instanceof(Array).and.have.lengthOf(3);
                res.body.should.eql([{ 'metric': 'temperature', 'stat': 'min', 'value': 27.1 },
    								{ 'metric': 'temperature', 'stat': 'max', 'value': 27.5 },
    								{ 'metric': 'temperature', 'stat': 'average', 'value': 27.3 }]);
                //console.log(res.body);
                done();
            });
    });

    it(" Get stats for a sparsely reported metric", function(done) {
    		var unit = "/stat?stat=min&stat=max&stat=average&fromDateTime=2015-09-01T16:00:00.000Z&toDateTime=2015-09-01T17:00:00.000Z&metric=dewPoint";
    		var queryParams = url.parse(unit, true);	
            var stat = queryParams.query.stat,
            	from = queryParams.query.fromDateTime,
            	to = queryParams.query.toDateTime,
            	metric = queryParams.query.metric;
        	//console.log(stat,from,to,metric);
            agent.get(unit)
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(200);
                res.body.should.be.instanceof(Array).and.have.lengthOf(3);
                res.body.should.eql([ { 'metric': 'dewPoint', 'stat': 'min', 'value': 16.9 }, 
                					{ 'metric': 'dewPoint', 'stat': 'max', 'value': 17.3 }, 
                					{ 'metric': 'dewPoint', 'stat': 'average','value': 17.1 }]) ; 
                done();
            });
    });

    it("Get stats for a metric that has never been reported", function(done) {
    		var unit = "/stat?stat=min&stat=max&stat=average&fromDateTime=2015-09-01T16:00:00.000Z&toDateTime=2015-09-01T17:00:00.000Z&metric=precipitation";
    		var queryParams = url.parse(unit, true);	
            var stat = queryParams.query.stat,
            	from = queryParams.query.fromDateTime,
            	to = queryParams.query.toDateTime,
            	metric = queryParams.query.metric;
        	//console.log(stat,from,to,metric);
            agent.get(unit)
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(200);
                res.body.should.be.instanceof(Array).and.have.lengthOf(0);
                //console.log(res.body);
                done();
            });
    });

    it(" Get stats for more than one metric", function(done) {
    		var unit = "/stat?stat=min&stat=max&stat=average&fromDateTime=2015-09-01T16:00:00.000Z&toDateTime=2015-09-01T17:00:00.000Z&metric=temperature&metric=dewPoint";
    		var queryParams = url.parse(unit, true);	
            var stat = queryParams.query.stat,
            	from = queryParams.query.fromDateTime,
            	to = queryParams.query.toDateTime,
            	metric = queryParams.query.metric;
        	//console.log(stat,from,to,metric);
            agent.get(unit)
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(200);
                res.body.should.be.instanceof(Array).and.have.lengthOf(6);
                res.body.should.eql([{ 'metric': 'temperature', 'stat': 'min', 'value': 27.1 },
    								{ 'metric': 'temperature', 'stat': 'max', 'value': 27.5 },
    								{ 'metric': 'temperature', 'stat': 'average', 'value': 27.3 },
    								{ 'metric': 'dewPoint', 'stat': 'min', 'value': 16.9 },
    								{ 'metric': 'dewPoint', 'stat': 'max', 'value': 17.3 },
    								{ 'metric': 'dewPoint', 'stat': 'average', 'value': 17.1 }]);
                done();
            });
    });

});
