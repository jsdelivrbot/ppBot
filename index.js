var prompt = require('prompt-sync')();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var MyCoolAgent = require('./MyCoolAgent');
var message = "text";
var greenlight = 1;


var express = require('express');
var app     = express();

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});


var https = require('https');

setInterval(function() {
    https.get("https://lp-brainbot.herokuapp.com/");
}, 600000); // every 5 minutes (300000) every 10 minutes (600000)


var openConvs = {};

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
  username: '1e4d4a45-9bce-47c4-8741-b02df5e38854',
  password: 'mCFsSCyhU3qO',
  path: { 
       workspace_id: '57d649f4-9270-4b52-b921-ec967632cbd7'
  }, 
  version_date: '2016-07-11'
});

var echoAgent = new MyCoolAgent({
  accountId: '38446654', //replace with your Account ID
  username: 'Brainbot', //replace with bot username
  password: 'Pa55w0rd99' //replace bot password
});

var context = {};
var dialogID = "";

// Start conversation with empty message.
//conversation.message({}, processResponse);

// Process the conversation response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }

  context = response.context;

  // If an intent was detected, log it out to the console.
  if (response.intents.length > 0) {
    console.log('Detected intent: #' + response.intents[0].intent);

     // If an escalation intent is detected, escalate.
     if (response.intents[0].intent == "escalate") {

         echoAgent.publishEvent({
            dialogId: dialogID,
            event: {
                type: 'ContentEvent', 
                contentType: 'text/plain', 
                message: "Just one moment, I'm transferring you to an agent now!"
            }
     });

       setTimeout(function(){ escalatetohuman(); }, 2000);
       
       console.log('Escalation detected: #' + response.intents[0].intent);
       
     }

     // If an escalation intent is detected, escalate.
     if (response.intents[0].intent == "changemyaddress") {

         echoAgent.publishEvent({
            dialogId: dialogID,
            event: {
                type: 'ContentEvent', 
                contentType: 'text/plain', 
                message: "TOBi our virtual assistant can help you change address!"
            }
     });
       setTimeout(function(){ escalatetobot(); }, 2000);    
       console.log('Escalation detected: #' + response.intents[0].intent);
       
     }


  }


  // Display the output from dialog, if any.

  if (response.output.text.length != 0) {

    for (var i = 0; i < response.output.text.length; i++) {


     



      console.log(response.output.text[i]);


      
      echoAgent.publishEvent({
            dialogId: dialogID,
            event: {
                type: 'ContentEvent', 
                contentType: 'text/plain', 
                message: response.output.text[i]
            }
        });
        console.log (dialogID);



	if (response.output.text[i] === "I'm transferring you to an agent now!") // insert here the answer that triggers the escalation
	{
        console.log("Need to transfer to agents."); 
        leaveChat();       
        }


   }

}
  // Display the full response for logs
  //console.log(response);

}

echoAgent.on('MyCoolAgent.ContentEvnet',(contentEvent)=>{
          greenlight = 1;
          dialogID = contentEvent.dialogId;
        
          console.log("sending message: " + contentEvent.message);
          message = contentEvent.message;

          setTimeout(function(){
                       

              if(greenlight){

                 conversation.message({
                     input: { text: message },
                     context : context
                 }, processResponse);
                 greenlight = 0;
              }


          }, 5000);
});


function escalatetohuman() {
  echoAgent.updateConversationField({
    conversationId: dialogID,
    conversationField: [
      {
        field: "ParticipantsChange",
        type: "REMOVE",
        role: "ASSIGNED_AGENT"
      },
       {
          field: "Skill",
          type: "UPDATE",
          skill: "212578213"
      }
    ]
  }, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("transfered to human completed");
    }
  });
}

function escalatetobot() {
  echoAgent.updateConversationField({
    conversationId: dialogID,
    conversationField: [
      {
        field: "ParticipantsChange",
        type: "REMOVE",
        role: "ASSIGNED_AGENT"
      },
       {
          field: "Skill",
          type: "UPDATE",
          skill: "955505632"
      }
    ]
  }, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("transfered to bot completed");
    }
  });
}
