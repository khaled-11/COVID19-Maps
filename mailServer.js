"use strict";

//var {google} = require('googleapis');
//const SMTPServer = require("smtp-server").SMTPServer;

// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
//var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

//const SMTPConnection = require("nodemailer/lib/smtp-connection");
//const SMTPServer = require("smtp-server").SMTPServer;

// const server = new SMTPServer({
//     secure: true,
//     //key: fs.readFileSync("private.key"),
//     //cert: fs.readFileSync("server.crt")
//   });
//   server.listen(465);


const nodemailer = require('nodemailer');
require('dotenv').config();

function sendConfirmation(recipient_email) {
   const eAddress = "cap.khaled.ledo@gmail.com";
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        secureConnection: 'tls',
        port: 587,
        requiresAuth: true,
        domains: ["gmail.com", "googlemail.com"],
        auth: {
          user:"cap.khaled.ledo@gmail.com",
          pass:"dbarmbbpgqawerhy"
        },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
    ciphers:'SSLv3'
      },
    requireTLS : false,
    debug: false,
    logger: true
});


    let eConfirm= {
        from: eAddress, 
        to: recipient_email,
        subject: "Mail from COVID MAPS",
        text: "Hey, please confirm here.",
 
    }

    transporter.sendMail(eConfirm, function(err){
        if(err){
            console.log(err);
            console.log("Failed to send email.\n");
            return;
        }
        else{
            console.log("Confirmation sent successfully!");
        }
    });
}


module.exports.sendConfirmation = sendConfirmation;
