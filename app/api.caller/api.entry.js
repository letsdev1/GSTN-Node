var request =require('request')
var context = require('../shared/shared.context');
var helper = require('../helper');



    //Developer: Vikas B
    //Date: 9/7/2017 
    //Purpose: This module will contain all the API calls like Auth, GSTR etc.
    // This will be a single entry point for all the GSTN API Calls so we don't have to look
    // anywhere else.


    
module.exports = {


    gstr1_save(gstin, retPeriod, authToken ,userName, stateCode, ipAddress, txnID, gstrData , callback){
        
        var urlOptions = {
                'clientid':helper.Constants.ClientID,
                'client-secret':helper.Constants.ClientSecret,
                'state-cd':stateCode,
                'ip-usr':ipAddress,
                'txn':txnID,
                'content-type':'application/json',
                 gstin: gstin,
                 ret_period: retPeriod,
                 auth_token: authToken
            }

            var payload = JSON.stringify(gstrData);
            var url = helper.URLS.GSTR1_B2BInvoices() + '';
            request({
                    url: url,
                    headers: urlOptions,
                    method:'put', 
                    json: payload
                }, function(error, response, body){
                        console.log('body', body);
                        var commonObject = helper.Helper.bindToCommonObj(error, body);
                        callback(error, commonObject);
                });




    },



    //Developer: Vikas B
    //Date: 9/7/2017 
    //Purpose: This Auth will hit the GSTN to Authenticate, and 
    
    Auth(otp, userName, stateCode, ipAddress, txnID, callback){

            var urlOptions = {
            'clientid':helper.Constants.ClientID,
            'client-secret':helper.Constants.ClientSecret,
            'state-cd':stateCode,
            'ip-usr':ipAddress,
            'txn':txnID,
            'content-type':'application/json'
        }    



            

        var payload = {
            "action":"OTPREQUEST", 
            "app_key": context.Context.AppKey, 
            "username":userName
        };

        if(otp != ''){
            payload = {
            "action":"AUTHTOKEN", 
            "app_key": context.Context.AppKey, 
            "username":userName,
            "otp":otp
            }
        }

        var url = helper.URLS.Authenticate() + '';


        //console.log('otp is ', payload);

        request({
                url: url,
                headers: urlOptions,
                method:'post', 
                json: payload
            }, function(error, response, body){
                    var commonObject = helper.Helper.bindToCommonObj(error, body);
                    callback(error, commonObject);
            });

    }




}