# COVID19-Maps
Custom Map connected to a Facebook Messenger Chatbot to help people locate resources during COVID19 pendemic.

# How to install this application?
You will need noe.js installed on your computer or host the application on any server that suuports node.js.

You can clone/download this repository and create a .env file in the main folder with the following variables:
GEOCODER_API_KEY= ( The API Key for the GEO Coder provider)
GEOCODER_PROVIDER= (The provider name of your preferred GEO Coder)
PAGE_ACCESS_TOKEN= (The access token for Facebook page that will use for the Messenger experience - Check the Facebook Developers website)
MONGO_URI= (The connection link to a remote Mongodb Database or you may use a local one)
PORT= (Incase you need to use a special port)

Then you will run $npm install and then $node main.js

You may use secure tunnel on your local computer like ngrok or deploy the experience to your preferred server.
