var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var helper = require('./app/helper')
var path = require('path');
var api = require('./app/api.builder')
var logger = require('./app/logs/logger')


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());




app.use('/otp', function(req, res){
    var json = req.body;
});

/*

Purpose: Entry point for authentication first time

Payload: {
	"user":"Viso.TN.TP.1",
	"state_code":33,
	"ipaddress":"192.198.99.102",
	"otp":"575757"
}
*/



app.use('/authenticate', function(req, res){

    var json = req.body; //get the json object from request body.


    //validate the input
    var validated = helper.Helper.commonAPI(json, 'api-auth');

    if(validated.validated==false){
        res.json(api.GenerateReturnBody_Single(api.GetCode('auth-fail'), 'fail', validated.message,null,null));
    }else{

        //now call the authenticate function in API Builder
        api.Authenticate(json.otp, json.user, json.state_code, json.ipaddress,validated.uniqueID, function(response){
            res.json(response);
        });
    }
});


    //Developer: Vikas B
    //Date: 9/29/2017 
    //Purpose: the entry point for gstr1 save. 
    /*

    Payload: {
        "user":"Viso.TN.TP.1",
        "retperiod":'',
        "gstin":'',
        "auth_token":'',
        "state_code":33,
        "ipaddress":"192.198.99.102",
        "gstrdata":"{gstrdata of type }"
    } 
   */

    app.use('/returns/savegstr1', function(req, res){
        var json = req.body; //get the json object from request body.


        //validate the input
        var validated = helper.Helper.commonAPI(json, 'api-gstr1');

        if(validated.validated==false){
            res.json(api.GenerateReturnBody_Single(api.GetCode('gstr1-fail'), 'fail', validated.message,null,null));
        }else{
            //now call the gstr save function in API Builder

            api.Gstr1_Save(json, validated.uniqueID ,function(response){
                res.json(response);
            });
        }
        
    });

app.listen(9502, function () {
    console.log('Program starting on port 9502...');
    
    try{
        helper.Helper.initApp(); // VB 9/15/2017 Initializing the app session variables

    }catch(error){
        console.log(error);
        logger.Logger.logError('Error caught at ')
    }
});

