var encryptionHelper=require('./crypto')
var helper = require('./helper');
var logger = require('./logs/logger');
var context = require('./shared/shared.context');
var api = require('./api.caller/api.entry');
var util = require('util');
module.exports = {




        /*

        VB - 9/21/2017

        These kind of inputs will be declared in order to set up the specifications. So we can predecide as to aceept what and what should be the format of the incoming api payloads

        the format will be: name, datatype, mandatory, and blankAllowed. .
        */
        apinput_authentication:{values:[
            {
                name:'otp',
                data_type:'integer',
                mandatory: true,
                blankAllowed:false
            },
            {
                name:'user',
                data_type:'string',
                mandatory: true,
                blankAllowed:false
            },
            {
                name:'state_code',
                data_type:'integer',
                mandatory: true,
                blankAllowed:false

            },
            {
                name:'ipaddress',
                data_type:'string',
                mandatory: true,
                blankAllowed:false

            },

        ]},

        apinput_otp:{values:[
            {
                name:'user',
                data_type:'string'
            },
            {
                name:'state_code',
                data_type:'integer'
            },
            {
                name:'ipaddress',
                data_type:'string'
            },

        ]},

    //Developer: Vikas B
    //Date: 9/7/2017 
    //Purpose: It will be used to fire the OTP Request

    // user helper.Constants.TestUser for using the test user.

    fireAuth(otp, user, stateCode, ipAddress, txnCode, callBack){ 
        context.LoggedUser = user;



        // fire the API request 
            api.Auth(otp,  user, stateCode,  ipAddress, txnCode, callBack);

    },


    //Developer: Vikas B
    //Date: 9/7/2017 
    //Purpose: This function will be the entry point for authentication.

    Authenticate(otp, user, stateCode, ipAddress, txnCode, callback){
            logger.Logger.log('API Builder.Authenticate', 'entered in the function. First line','',1,false);

            var ths=this;
            otp = '' + otp;
            var otpRequest = otp=='';
            var encryptedKey = '';

            //first step is to convert the Application Key into an encrypted key using 
            // VB 9/11/2017 Right now, I assume that Appkey will be specific to an application so we will need to create an APP key to be used by our API Calls.
            logger.Logger.log('API Builder.Authenticate', 'Trying to encrypt with the Appkey ' + helper.Constants.AppKey,'',5,false);
            encryptedKey = encryptionHelper.encryptWithPublicKey(helper.Constants.AppKey, './assets/GSTN_G2A_SANDBOX_UAT_public.pem');

            //store the key into Context so it can be reused 
            context.Context.AppKey = encryptedKey;

            var encryptedOTP = '';
            if(otp!=''){
                try{
                    //encrypt the otp.
                    encryptedOTP = encryptionHelper.encrypt(otp);
                } catch(error){
                    console.log(error);
                        var returnValue= ths.GenerateReturnBody_Single(code, 'failure', 'otp encryption error', error.message, null); // no error, so send 
                }
            }

            //callback function will ensure that it is either returning a success or a failure. it will hit the callback with an object which is of a fixed type. 

            this.fireAuth(encryptedOTP, user, stateCode,ipAddress, txnCode,function(error, commonObject){
                logger.Logger.log('API Builder.Authenticate', 'Inside fireAuth callback','',2,false);
                    if(commonObject.Success){
                        logger.Logger.log('API Builder.Authenticate', 'Inside fireAuth callback - Success block','',1,false);
                        var code =  ths.GetCode(otpRequest?'otp':'auth','success');
                        
                        /*
                        Vikas B 9/19/2017 
                        Bind the Auth to context
                        */


                        context.Context.AuthToken = commonObject.JSON.auth_token;
                        context.Context.sek = commonObject.JSON.sek;

                        logger.Logger.log('API Builder.Authenticate', 'Auth Token pulled:' + context.Context.AuthToken,'',1,false);

                        var returnValue= ths.GenerateReturnBody_Single(code, 'success', otpRequest?'otp produced successfully':'authenticated successfully', commonObject.JSON, null); // no error, so send null in place of error
                        //store the auth key with yourself
                        callback(returnValue);
                    }else{

                        //error ==> it will be either an error, or the API error.
                        logger.Logger.log('API Builder.Authenticate', 'Inside fireAuth callback - Error block','',1,false);
                        var code =  ths.GetCode('otp','fail');
                        var returnValue= ths.GenerateReturnBody_Single(code, 'fail', commonObject.ErrorMessage,null  , commonObject.CombinedErrorObject); // send null for data, and error for error. 
                        callback(returnValue);
                    }
                
                });
    },



    //Developer: Vikas B
    //Date: 9/29/2017 
    //Purpose: This function will be the entry point for saving 

    /*
    params:
        payload: will be the user, statecode, ipaddress, txncode, and GStr data. It will also contain user, gstr data.
    */

    Gstr1_Save(payload, uniqueCode, callback){
        logger.Logger.log('API Builder.', 'Entered in the function. First line','',1,false);
        var ths = this;

        
        

        api.gstr1_save(payload.gstin, 
                        payload.retperiod, 
                        payload.auth_token,
                        payload.user,
                        payload.state_code, 
                        payload.ipaddress,
                        uniqueCode,
                        helper.Helper.prepareGstr(),
                        callback                
                    );


    },








    //Developer: Vikas B
    //Date: 9/12/2017 
    //Purpose: this function will convert the body object into an array because we will make sure we dont return a single object, ever.
    
    GenerateReturnBody_Single(code, result, message, data,error){
        var datas =[] ;
        datas.push(data);
        return this.GenerateReturnBody_Array(code, result, message, data);

    },

    //Developer: Vikas B
    //Date: 9/12/2017 
    //Purpose: This converts the 

    GenerateReturnBody_Array(code, result, message, data, error){
        var success = {
            code: code,
            result: result,
            message: message,
            data: data,
            error: error
        }; //result can be fail or success


        logger.Logger.log('API Builder - GenerateReturnBody_Array', 'Object returning - ' + JSON.stringify(success),'',5,false);
        return success;
    },

    //Developer: Vikas B
    //Date: 9/12/2017 
    //Purpose: 

    GetCode(key, result){

        /*
        VB 9/12/2017
        declare keys right here
        */

        var keys =  {};

        keys['otp-success'] = 1;
        keys['otp-fail'] = 0;

        keys['auth-success'] = 1;
        keys['auth-fail'] = 0;
      
        var output = keys[ key +  '-' + result]
        
        logger.Logger.log('API Builder - Get Code ',  util.format('key = {0} and result = {1} and the output is ', key, result, output),'',3,false);

        return output;
    },

    //Developer: Vikas Bhandari
    //Date : 9/19/2017
    //Purpose: with every API being pulled in, we need to make sure that every API is well formed and not corrupt

    //param: json: the json object to be validated key: the key with specifications already bundled on the top of the class

    validateInput(json, key){

        /*
            9/19/2017 | VB 
            Definitions will be coming in here with two properties, name, and datatype
        */
        
        var specifications = this.getSpecifications(key);

        //if we dont get any specifications, let's call it a pass 

        if(specifications){
            var values = specifications.values;

            //now values are supposed to contain an array of {name,datatype,mandatory}

            //loop through the values and find if mandatory keys are available or not &  if available, the datatype matches or not

            var validated = true;
            var message = '';

            values.forEach(function(element) {


                //now if validated is false, then it couldn't pass through the validations. Exit
                //writing this block on top because I don't want to check if previous validation passed etc etc on each time so i will just continue if validation = false, and the execution point will flow  to this block immediately

                if(validated){ //if validated = false, let it run through the loop.. the loop is going to be very small anyway so doesn't matter much if we let loop run if it doesn't satisfy the condition.



                    //now check if this field is mandatory or not

                    var jsonObject = json[element.name];
                    console.log(jsonObject);
                    if(element.mandatory == true){
                        //it's a mandatory field it
                        var found = false;
                        for(var jsonKey in json){
                            if(jsonKey  === element.name){
                                    found = true;
                                    break;
                                }
                            }

                            if(!found){
                                validated = false;
                                message = element.name + ' is a mandatory field for this request';
                            }
                    }

                    var isUndefined = jsonObject == undefined || jsonObject == null || jsonObject == '';
                    if(validated){

                            if(!element.blankAllowed && isUndefined){
                                //blanks not allowed here 
                                validated = false;
                                message = element.key + ' should contain some value. It is blank right now';

                            }
                    }

                    if(validated){
                        if(isUndefined){
                            //no need to check if there is no value.

                        }else{
                        //now check if it accepts blank or not

                        //now check if the datatype matches

                            switch(element.data_type){
                                case 'string':
                                    //everything is a string anyway
                                    break;
                                case 'integer':
                                    validated = validated && util.isNumber(jsonObject);
                                    if(!validated){
                                        message = element.name + ' should be a number value';
                                        //continue;
                                    }
                                    break;
                                case 'date':
                                    validated = validated && util.isDate(jsonObject);
                                    if(!validated){
                                        message = element.name + ' should be a date value';
                                    }
                                    break;
                            }
                        }
                    }
                }

                    

            }, this);



        return {
            validated:validated,
            message:message
        }

        }else{
            return {
                validated:true,
                message:''
            };
        }

    },

    
    getSpecifications(key){

        //add the authentication to the final dictionary

        switch(key){
            case('api-auth'):
                return this.apinput_authentication;
                break;
            case('api-otp'):
                return this.apinput_otp;
                break;
            default:
                break;
        }


    }

    

}