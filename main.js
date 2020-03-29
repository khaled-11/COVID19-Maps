const FBMessenger = require('fb-messenger');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const messenger = new FBMessenger({PAGE_ACCESS_TOKEN});
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

messenger.setToken(PAGE_ACCESS_TOKEN);

//// Redirect the index calls to the MAPs API Application ////
// Enable cors //
main.use(cors());
// Set static folder //
main.use(express.static(path.join(__dirname, 'public')));
// Routes //
main.use('/api/v1/stores', require('./routes/stores'));
//Start the Server.
main.listen(process.env.PORT || 3370, () => console.log('webhook is listening'));

//var users = {};

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


      var info = messenger.getProfile({sender_psid, PAGE_ACCESS_TOKEN,
fields: "first_name"})

      console.log('Sender PSID: ' + JSON.stringify(info.first_name));
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
var te = received_message.text.trim().toLowerCase();
if (te.includes("1")) {
    response = {
      "text": `We received: "${received_message.text}"  . Is that right?`
}}else {

    response = {
      "text": `Welcome to COVID19 Maps. Please enter your address or zip code!`
}}



}else if (received_message.attachments) {
    // Get the URL of the message attachment
  //  let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Try the Map!",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://a1fc19aa.ngrok.io/",
              "title":"See Map",
              "webview_height_ratio": "full",
              "messenger_extensions": "true",
              //"fallback_url": "https://www.messenger.com/"
            }
          ]
        }
      }
    }
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
  if (payload === 'yes') {
    response = { "text": "Thanks" }
  } else if (payload === 'no') {
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Try the URL button!",
          "buttons":[
            {
              "type":"web_url",
              "url":"https://a1fc19aa.ngrok.io/",
              "title":"URL Button",
              "webview_height_ratio": "full",
              "messenger_extensions": "true",
              //"fallback_url": "https://www.messenger.com/"
            }
          ]
        }
      }
    }
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
    "uri": "https://graph.facebook.com/v2.6/me/messages",
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


// Get the user address //
function getAddress(sender_psid){
}

// Get the user email //
function getMail(sender_psid){
}

// Sending Confimation Email //
function sendEmail(sender_id, userMail){
  console.log("Sending in progress ....");
  sendConfirmation.sendConfirmation(userMail);
  confirmation=createResponse("Please check your email.");
  callSendAPI(sender_id, confirmation);
}