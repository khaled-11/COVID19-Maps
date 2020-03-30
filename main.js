//const FBMessenger = require('fb-messenger');
//const asyncjs = require('async');
//const curl = require('curl');
//const messenger = new FBMessenger({PAGE_ACCESS_TOKEN});
//"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const main = express().use(bodyParser.json()); 
require('dotenv').config()
const path = require('path');
const request = require('request');
const sendConfirmation = require("./mailServer");
const connectDB = require('./db');
const cors = require('cors');

// Connect to a Remote Database //
connectDB();

//// Redirect the index calls to the MAPs API Application ////
// Enable cors //
main.use(cors());
// Set static folder //
main.use(express.static(path.join(__dirname, 'public')));
// Routes //
main.use('/api/v1/stores', require('./routes/stores'));
//Start the Server.
main.listen(process.env.PORT || 3370, () => console.log('webhook is listening'));


// Testing Email // Works :)
//sendConfirmation.sendConfirmation("khaled.abouseada@icloud.com");





// Webhook Endpoint For Facebook Messenger //
main.post('/webhook', (req, res) => {  
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    
    
      // Get the sender PSID
      const sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
      //callUserInfo(sender_psid);
  
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      } 
    });
    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});




// Adds support for GET requests to our webhook
main.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "adsfhg"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});



function handleMessage(sender_psid, received_message) {
  let response;
  
  // Checks if the message contains text
  if (received_message.text) {    
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
var text = received_message.text.trim().toLowerCase();
if (text.includes("1") || text.includes("2") || text.includes("3") || text.includes("4")
|| text.includes("5") || text.includes("6") || text.includes("7") || text.includes("8")
|| text.includes("9") || text.includes("0")) {
  response = { 
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": `We received: "${text}". Is that correct?`,
        "buttons":[
          {
            "type":"postback",
            "payload":"YES",
            "title":"Yes"
          },
          {
            "type":"postback",
            "payload":"NO",
            "title":"No"
          }
        ]
      }
    }
  }  
  
}else if (text.includes("start over")){
 // handlePostback(sender_psid, START)
 response = { 
  "attachment":{
    "type":"template",
    "payload":{
      "template_type":"button",
      "text":"Welcome to COVID19 Maps. Please choose from below:?",
      "buttons":[
        {
          "type":"postback",
          "payload":"Map",
          "title":"View Map"
        },
        {
          "type":"postback",
          "payload":"SUBSC",
          "title":"Subscription"
        },
        {
          "type":"postback",
          "payload":"Help",
          "title":"Help"
        }
      ]
    }
  }
}
}else if (text.includes("@")){
  // handlePostback(sender_psid, START)
  em_send = text;
  response = { 
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text": `We received: "${text}". Is that correct?`,
        "buttons":[
          {
            "type":"postback",
            "payload": "YES_EMAIL",
            "title":"Yes"
          },
          {
            "type":"postback",
            "payload":"NO",
            "title":"No"
          }
        ]
      }
    }
  }
 }else {
}


}else if (received_message.attachments) {
    // Get the URL of the message attachment
  //  let attachment_url = received_message.attachments[0].payload.url;
  response = {"text": "Sorry, we don't handle attachment at this moment. Please say start over for the main menu."}
  } 
  
  // Send the response message
  callSendAPI(sender_psid, response);    
}


// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'YES') {
    response = { 
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
             {
              "title":"Welcome to COVID19 Maps!",
              "image_url":"https://techolopia.com/wp-content/uploads/2020/03/Profile.jpg",
              "subtitle":"Here you will find the places that are open during this pandemic. We also provide alerts about the dangerous nearby spots and more helpful information.",
              "default_action": {
                "type": "web_url",
                "url": "https://a1fc19aa.ngrok.io",
                "messenger_extensions": "true",
                "webview_height_ratio": "full",
              },
              "buttons":[
                {
                  "type":"web_url",
                  "url":"https://a1fc19aa.ngrok.io",
                  "title":"View Map"
                }
          ]
        }
      ]
      }
    }}} 
    else if (payload === 'START') {
      response = { 
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"Welcome to COVID19 Maps. Please choose from below:",
            "buttons":[
              {
                "type":"postback",
                "payload":"Map",
                "title":"View Map"
              },
              {
                "type":"postback",
                "payload":"SUBSC",
                "title":"Subscription"
              },
              {
                "type":"postback",
                "payload":"Help",
                "title":"Help"
              }
            ]
          }
        }
      }
  }else if (payload === 'NO') {
      response = { "text": "Sorry, please try again!" }
  } 
  else if (payload === 'Help') {
    response = { "text": 'Please wait while we connect you. Say "start over" to leave.' }
} 
else if (payload === 'SUBSC') {
  response = { "text": 'Please enter your email address.' }
} 
else if (payload === 'Map') {
  response = { "text": 'Please enter your zip code. EX: "ny 11214"' }
} 
else if (payload === 'YES_EMAIL') {
  sendConfirmation.sendConfirmation(em_send);
  response = { "text": 'We sent a confirmation. Please check your email.' }
} 
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v6.0/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}


// Get the user address and add it to the database //
function getAddress(sender_psid){
}

// Get the user email and add it to the database //
function getMail(sender_psid){
}




