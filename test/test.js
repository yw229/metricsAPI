var should = require("should");
var request = require("supertest");
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
    		.expect("Content-type", /json/)
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
    		.expect("Content-type", /json/)
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
            .expect("Content-type", /json/)
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

    it(" Get a measurement that does not exist", function(done) {	
            agent.get("/measurements/"+"2015-09-01T16:50:00.000Z")
            .expect("Content-type", /json/)
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 404
                res.status.should.equal(404);
                done();
            });
    });

    it("Get measurements from a day", function(done) {	
            agent.get("/measurements/"+"2015-09-01")
            .expect("Content-type", /json/)
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.body.length.should.equal(6); // 6 records within arry
                res.status.should.equal(200);
                done();
            });
    });

    it("Get measurements from a day", function(done) {	
            agent.get("/measurements/"+"2015-09-01")
            .expect("Content-type", /json/)
            .expect(200) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.body.length.should.equal(6); // 6 records within arry
                res.status.should.equal(200);
                done();
            });
    });

    it("Get measurements from a day where no measurements were taken", function(done) {	
            agent.get("/measurements/"+"2015-09-03")
            .expect("Content-type", /json/)
            .expect(404) // THis is HTTP response
            .end(function(err, res) {
                // HTTP status should be 200
                res.status.should.equal(404);
                done();
            });
    });

});
