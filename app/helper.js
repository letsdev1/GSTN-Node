var fso=require('fs');
var path=require('path');
var logger = require('./logs/logger');
var context = require('../app/shared/shared.context');
var api = require('./api.builder')

//the Constants like URL or the version, or if we are running a sandbox version etc

module.exports.Constants={
    Sandbox:true,
    Version : 'v0.2',

    URL_Authentication:'/authenticate',
    URL_GSTR1_B2B_Invoices:'/returns/gstr1',
    URL_Domain:'http://devapi.gstsystem.co.in/taxpayerapi',

    AppKey : 'xxxx',
    TestUser : 'xxx',
    StateCode : 33,

    GSTNID : 'xxxx',

    ClientID:'xxx',
    ClientSecret:'xxx',

    UseQ:false, // if we ever need to implement a queue, we will use this flag
    LogLevel:5, // means that we need to log the logs which has level <value> or less
    adminEmail: 'vikasbhandari2@gmail.com' //''
},



//this module will store all the json payloads and header information
module.exports.JsonNames={

    //Authentication Json Payloads:

    Action : 'action',
    UserName : 'username',
    AppKey : 'app_key',
    OTP:'otp'
},

module.exports.URLS = {
    helper : require('../app/helper'),

    GSTR1_B2BInvoices(){
        return this.helper.Constants.URL_Domain + '/' + this.helper.Constants.Version + this.helper.Constants.URL_GSTR1_B2B_Invoices;
    }
    ,
    Authenticate(){
        return this.helper.Constants.URL_Domain + '/' + this.helper.Constants.Version + this.helper.Constants.URL_Authentication;
    }

},

    //Developer: Vikas B
    //Date:  9/9/2017
    //Purpose: This module will contain the fileHelper methods

    /*
    one of the important function this object will do is that it will keep a copy of all the filenames whose existence has been checked.
    fs.fileExists() method is very expensive and we cannot afford to write too many logs so we will keep a copy of existence check so we
    dont have to call it again and again
    */

module.exports.fileHelper = {

    _filesChecked:{},
    
    checkFileExists(path){
        if(this._filesChecked[path] == true){
            //already there 
            return true;
        }else{
            //check if it fileExists

            if(fso.exists(path)){
                //exits. Add in the collection so we dont have to check it again
                this._filesChecked[path] = true;
            }else{
                //doesnt exist. don't add it in a collection because it may be created after calling this procedure.
            }

        }
    }


},

module.exports.Helper = {
    helper : require('../app/helper'),

  //Developer: Vikas B
    //Date:  9/11/2017
    //Purpose: This function will be the entry point of the Application.
    // please assign any variables

    initApp(){
        try{


            var fileName = path.resolve(__dirname, '..') + '/logs/logs.' + this.getNowObject(false,false) + '.txt';

            // VB 9/11/2017

            logger.Logger.init(fileName,'vikasbhandari2@gmail.com', 'admin@e2cs.in');
            logger.Logger.log('main.js','--Program Started--','',1,false);

            // VB 9/18/2017
            // We also need to store the Application Key Bytes to be used later on for encryption

            context.Context.AppKeyBytes = Buffer.from( this.helper.Constants.AppKey, 'utf8' )
            ////console.log('byte array...',context.Context.AppKeyBytes);

        }catch(error){
            console.log('error....',error);
            logger.Logger.logError('main.js','',error, false);
        }

    },


    //Developer: Vikas B
    //Date: 9/29/2017 
    //Purpose: the common function for entering logs and generating unique ID etc. 

    /*
        params:
            random: random is required to generate a random key so it is not repeated for any other user
            json: the json received as payload
            apiSource: the api source to be logged in the API call so we know where the call is coming from
            apiInputKey: the apiInputKey will be used to find the inputs of json

    */



    commonAPI(random, json, apiSource , apiInputKey){

        //VB 9/18/2017 create the unique id / transaction key
        var helper=require('./helper');

        var uniqueID = random + helper.Helper.getNowObject(true,true);

        //check if the keys in json as validated correctly or not. If not, then throw a message
        var validated = api.validateInput(json, apiInputKey);

        //create the log API entry call
        helper.Helper.logAPI(apiSource, uniqueID);

        return {
            validated:validated.validated,
            message:validated.message,
            uniqueID:uniqueID
        };
    },


    //Developer: Vikas B
    //Date: 9/18/2017
    //Purpose: Just to keep main.js clean, adding a logger method so we can log the API entries to GSTNID

    logAPI(apiName, uniqueID){
        logger.Logger.log('API Entry','Entry raised for transaction ID ' + uniqueID + ' from ' + apiName, '' ,5,false);
    },



    //Developer: Vikas B
    //Date:  9/18/2017
    //Purpose: there is no direct function available in js to get the date text. it will return something like this

    getNowObject(useTime, useMillis){
            var d = new Date();
            var month = '' + (d.getMonth() + 1);
            var day = '' + d.getDate();
            var year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            if(useTime == true){
                var hour = d.getHours();
                var minute = d.getMinutes();
                var second = d.getSeconds();
                var millisecond =  d.getMilliseconds();

                if (hour.length < 2) hour = '0' + hour;
                if (minute.length < 2) minute = '0' + minute;
                if (second.length < 2) second = '0' + second;
                if (millisecond.length < 2) millisecond = '0' + millisecond;
                    if(useMillis){
                        return [year, month, day, hour, minute, second, millisecond].join('.');
                    }else{
                        return [year, month, day, hour, minute, second].join('.');
                    }
            }else{
                return [year, month, day].join('.');
            }
        
    },

    prepareGstr(){


        var b2bs=[];
        var invs=[];
        var items=[];



        var b2b={
            ctin:'27GSPMH4371G1ZI',
            invs:[]
        };

        b2bs.push(b2b);

        var inv = {
          inum: '1',
          idt: '16/7/2017', //date format
          val: 18900,
          pos: '27',
          rchrg: 'N',
          etin: '27GSPMH4371G1ZI',
          inv_typ: 'R',
            itms: []
        };

        var itm={
              num: 1,
              itm_det: {
                rt: 18,
                txval: 10000,
                iamt: 1800,
                csamt: 0
              }
        };

        items.push(itm);

        itm={
              num: 2,
              itm_det: {
                rt: 18,
                txval: 15000,
                iamt: 2700,
                csamt: 0
              }
        };

        items.push(itm);


        itm={
              num: 3,
              itm_det: {
                rt: 18,
                txval: 30000,
                iamt: 5400,
                csamt: 0
              }
        };

        items.push(itm);


        itm={
              num: 4,
              itm_det: {
                rt: 18,
                txval: 2820.00,
                iamt: 0,
                csamt: 0
              }
        };

        items.push(itm);
        inv.itms=items;

        var gstr={
                gstin: '33GSPTN4371G1Z5', //
                fp: '2017-07',
                gt: 190000.00,
                cur_gt: 19000.00,
                b2b: []
            }

        gstr.b2b = b2bs;
    
        return gstr;
    },

    //Developer: Vikas B
    //Date: 9/12/2017 
    //Purpose: will bind the result to a common object to be used for reference lately
    // it will convert the result/error into a fixed format so the consumer can easily use it without
    // worrying too much about the format

    bindToCommonObj(error, response){


        //console.log(response);

        var common = {
            StatusCode: response.status_cd,
            Success : false, //keep it false and set it passed only if it passes at the calling method
            JSON:response,
            CombinedErrorObject: {
                APIError: response.error?true:false,
                APIErrorMessage: response.error?response.error.message:'',
                APIErrorCode: response.error?response.error.error_cd:'',
                Error:error?true:false,
                ErrorCode  : error?error.number:0,
                ErrorDescription  : error? error.message:''
            },


        }

        common.Success = !(common.CombinedErrorObject.Error || common.CombinedErrorObject.APIError);

        common.ErrorMessage = '' + ((common.CombinedErrorObject.Error)? (common.CombinedErrorObject.ErrorCode + ' - ' + common.CombinedErrorObject.ErrorDescription): (common.CombinedErrorObject.APIError))? (common.CombinedErrorObject.APIErrorCode + ' - ' + common.CombinedErrorObject.APIErrorMessage):'';


        return common;
    },


}



