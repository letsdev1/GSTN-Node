var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var helper = require('./app/helper')
var api = require('./app/api.builder')
var logger = require('./app/logs/logger')

app.use('/', function(req,res){
    res.json('i m ready');
});


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());



app.use('/otp', function(req, res){
    var json = req.body;
});

/*


Payload: {
	"user":"Viso.TN.TP.1",
	"state_code":33,
	"ipaddress":"192.198.99.102",
	"otp":"575757"
}
*/

app.use('/authenticate', function(req, res){
    var json = req.body; //get the json object from request body.


    //VB 9/18/2017 create the unique id / transaction key

    var uniqueID = json.user + helper.Helper.getNowObject(true,true);

    //create the log API entry call

    helper.Helper.logAPI('',uniqueID);

    //now call the authenticate function in API Builder
    api.Authenticate(json.otp, json.user, json.state_code, json.ipaddress,uniqueID, function(response){
        res.json(response);
    });
    
});


app.listen(9502, function () {
    console.log('Program starting on port 9502');
    helper.Helper.initApp(); // VB 9/15/2017 Initializing the app session variables
});

