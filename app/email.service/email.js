const nodemailer = require('nodemailer');
const logger=require('../logs/logger');

const useQ  = false;

//Developer: Vikas B
//Date: 9/8/2017 
//Purpose: This module will be used to send emails.


// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    
    host: 'smtp.mailgun.org',
    port:587,
    
    auth: {
        user: 'postmaster@mail.lets-dev.com',
        pass: '70ebdcf8407b41890712fe67c23f63ca'
    }
});



//Developer: Vikas B
//Date: 9/8/2017 
//Purpose: This function will send email. From and Attachments are optional, other are required

//sample object
/*
    var data = {
        to='vikasbhandari2@gmail.com,
        from='vikas@lets-dev.com',
        subject='Test Subject line',
        content:'<h1> Dear Customer</h1> <br> <br> <h3> Please contact customer care for any support. ',
        attachments: [{
            fileName:'report1.txt',
            path:'../output/reports/report1.txt'
        },
        
        {
            fileName:'reportPnL.txt',
            path:'../output/reports/reportPNL.txt'
        },
        {
            fileName:'BS.txt',
            path:'../output/reports/BS.txt'
        }
        ]
    };
*/



    
function SendEmail(data) {

    //console.log("email module ==>" + data.to);
    //data.to = "himansh.tiwari24@gmail.com,jithin001@gmail.com";

    let mailOptions = {
        from: data.from? data.from:'no-reply@lets-dev.com',
        to: data.to,
        subject: data.subject,
        html: data.content,
        attachments: data.attachments
    };

// send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            //console.log('error in email', error.message);
            return false;
        }
            //console.log('email sent', info);
        return true;
    });

}

exports.SendEmail = SendEmail;