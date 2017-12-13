const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


var admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var data;
var teamName;

exports.Pushtrigger = functions.database.ref('/teams/{teamName}/{id}').onWrite((event)=>{
   data = event.data.val();

   
   teamName = data.teamName;
   console.log(teamName);
   



   admin.database().ref('/pushtokens').orderByChild('id').once('value').then((alltokens)=>{
   	 var rawTokens = alltokens.val();
   	 var tokens = [];
   	 	
   	 processtokens(rawTokens).then((processedTokens)=>{

      // push only those tokens whose team name matches the team name that is written


   	 	for( var token of processedTokens){
        

        console.log(token);

        var teams = token.teams;

        for(team of teams){
          console.log(team);

          if(team.title === teamName){

            tokens.push(token.devtoken);
          }
        }


        console.log(tokens);

   	 		
   	 	}
   	  

      var payload = {
	    "notification":{
		    "title":"New Message in " + teamName,
		    "body":"Message from " + data.username +" \""+data.message+"\"",
		    "sound":"default",
		    "click_action":"FCM_PLUGIN_ACTIVITY",
		    "icon":"fcm_push_icon"
	     },
		  "data":{
		    "param1":data.username,
		    "param2":data.message,
         "param3":teamName
		  }

      }

      return admin.messaging().sendToDevice(tokens,payload).then((response)=>{
         console.log('Pushed notification')
      }).catch((err)=>{
      	console.log(err);
      })


       })
      

   })
})


function processtokens(rawTokens){
 var promise = new Promise((resolve,reject)=>{

 	 var processtokens = []

     for( var tokens in rawTokens){
   	   processtokens.push(rawTokens[tokens])
     }

     resolve(processtokens);

 }) 

 return promise;


}