var prompt = require('prompt-sync')();
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


var echoAgent = new MyCoolAgent({
  accountId: '68283988', //replace with your Account ID
  username: 'botMarco', //replace with bot username
  password: 'Password123!!!' //replace bot password
});






function markConversation(dialogID) {
	
	const metadata = [{
		type: 'ActionReason',
		reason: 'escalated_by_bot', // The reason for escalation, can be other reason
		reasonId: '3'
	}];
	
	echoAgent.updateConversationField({
		conversationId: dialogID,
		conversationField: [
			{
				field: "ParticipantsChange",
				type: "ADD",
				role: "ASSIGNED_AGENT"
			},
			{
				field: "ParticipantsChange",
				type: "REMOVE",
				role: "ASSIGNED_AGENT"
			}
		]
	}, null, metadata, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("transfered completed");
		}
	});

	

}
