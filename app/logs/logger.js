
var fso = require('fs'); //file system object to operate through the log files
var helper= require('../helper') ; 
var queue = require('../jobs/jobs');
var email=require('../email.service/email');
//Developer: Vikas B
//Date: 9/8/2017 
//Purpose: Logging library, and will be able to email if required

module.exports.Logger= {

    

    _logsToAccumulate : 2,  // VB 9/10/2017 if not set to 0, it will log message only after collecting n number of messages where n is _logsToAccumulate value. Higher value will risk losing more number of messages if app crashes
     _fileName :'',
     _from :'',
     _emails : '',
     logs:'',
     logCounter: 0, 

    initialized : false,

    //Developer: Vikas B
    //Date: 9/8/2017 
    //Purpose: init will store the basic configurables like admin emails of fileName of the log file.
    // the emails will be a comma separated emails which will blast the mail to each one in the string. Email from will be used to send it to client while sending email. It will be the email which receiver will send the reply to

        init(fileName, emails, emailFrom){
            this._fileName = fileName;
            this._emails = emails;
            this._from = emailFrom;

            console.log('Logger inited', {
                emails:this._emails,
                fileName: this._fileName
            });
            
        },


        //Developer: Vikas B
        //Date: 9/8/2017 
        //Purpose: When we receive any error in code, it will log into the log file, with the current timestamp.
        // if sendEmail is sent as true, it will send this error as email to the emails mentioned in the email 
        // set while initing this object
    
        logError(source, path, error, sendEmail){
            var logText =  error.number + '-' +error.message;
            this.log(source, logText, path, 1, sendEmail);
        },


        //Developer: Vikas B
        //Date: 9/8/2017 
        //Purpose: This function will enter logs into the log file, with the current timestamp.
        // if sendEmail is sent as true, it will send this error as email to the emails mentioned in the email 
        // set while initing this object

        // I have introduced a new concept called Log Level. Sometimes we need very thorough logging, for example very detailed log, each and every step. I will call it a level 5. Sometimes I need bare minimum logs, which are considered a level 1. So I will now send with each log, which will tell this program that what level of log this is. With the help of a pre defined value somewhere in constant class, then we can easily decide as to which log we are currently needing to print. 

        log(source, 
            text, 
            path, 
            logLevel, 
            sendEmail){

            //don't process if the log level is set to use a lessor logging mechanism. 

            var newLog = text + ' | Request Originated from ' + source + ' | Logged at ' + Date.now() + '\n';
            //console.log(newLog);

            if(logLevel> helper.Constants.LogLevel){
                //no need to log if the logging level is set to a lessor value. 
                return;
            }

            if(path==''){
                path = this._fileName;
            }
            //console.log('need to log ', newLog);

            // run to queue if set 
            if(helper.Constants.UseQ){
                //send it to queue
                queue.createQueue('log.e2', {
                    log:text,
                    path:path,
                    logLevel:logLevel
                });

                // VB 9/11/2017
                // check for email too.


                // VB 9/11/2017 Create a data object to contain the information

                //send it to queue
                var data = getEmailObject('Log Email', newLog);
                queue.createQueue('email.e2', data);
            }
            else{

                //create the log file if it doesn't exist

                // VB 9/11/2017
                //commenting the following block because fs.AppendFile function creates the file it doesn't exist

                if(!helper.fileHelper.checkFileExists(source)){
                    //create the file
                    var stream = fso.createWriteStream(path);
                    stream.write('Log File - e2 | created at ' + helper.Helper.getNowObject(true, false) + ' \n\n ');
                    stream.close();

                    // VB 9/11/2017
                    //hold for half a milisecond so we get the time to create a new file. I don't want to jump to enter the log information until the file has been created.
                    setTimeout(function() {
                        //wait :)
                    }, 500); 
                }

                // VB 9-10-2017
                // Ok I don't want to log file everytime I get a comment. I am ready to take a risk
                // of loosing 10 messages when app crashes, but I am not willing to write to hard disk every god damn log line :)
                
                //append the date time to log

                this.logs = this.logs + newLog;

                this.logCounter++; //incrementing the log counter


                // VB 9/10/2017 I am going to log only when I have sufficient log lines according to the _logsToAccumulate variable.

                if(this.logCounter > this._logsToAccumulate){ 
                    this.logCounter = 0;

                    fso.appendFile(path, this.logs, function(error){
                        if(error){
                            console.log('error', error);
                        }else{
                        }
                    });
                }else{
                    //do nothing.
                }




            }


            // VB 9/11/2017
            // now we need to check if we have to send an email or not.



            if(sendEmail){
                var data = this.getEmailObject('Log Email', newLog);
                email.SendEmail(data);
            }

        },

        getEmailObject(subject, content){

            var data = {
                to : this._emails=''?helper.Constants.adminEmail:this._emails,
                from:this._from=''?helper.Constants.adminEmail: this._from,
                subject:'Log Email - ' + subject,
                content: content
            };

            return data;
        }
}

