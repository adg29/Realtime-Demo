/*

    Instagram real-time updates demo app.

*/


var url = require('url'),
  redis = require('redis'),
  settings = require('./settings'),
  helpers = require('./helpers'),
  subscriptions = require('./subscriptions');
var buffertools = require('buffertools');

var app = settings.app;


app.get('/callbacks/geo/:geoName', function(request, response){
    // The GET callback for each subscription verification.
  helpers.debug("GET " + request.url); 
  var params = url.parse(request.url, true).query;
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.post('/callbacks/geo/:geoName', function(request, response){
  helpers.debug("PUT /callbacks/geo/" + request.params.geoName);
   // The POST callback for Instagram to call every time there's an update
   // to one of our subscriptions.
    
   // First, let's verify the payload's integrity
   if(!helpers.isValidRequest(request)) {
     helpers.debug('FAIL')
     response.send('FAIL');
     return;
   }
    
    // Go through and process each update. Note that every update doesn't
    // include the updated data - we use the data in the update to query
    // the  API to get the data we want.
  var updates = JSON.parse(request.rawBody);
  var geoName = request.params.geoName;
  helpers.debug('geoNameParams')
  helpers.debug(geoName)
  for(index in updates){
    var update = updates[index];
    helpers.debug('updateLoop')
    helpers.debug(update)
    if(update['object'] == "geography")
      helpers.processGeography(geoName, update);
  }
  helpers.debug("Processed " + updates.length + " updates");
  response.send('OK');
});

app.post('/webhooks', function(request, response){
  helpers.debug("PUT /webhooks/" + request.params);
  response.send('OK');
});


// Render the home page
app.get('/', function(request, response){
  helpers.debug("render homepage");
  helpers.getMedia(function(error, media){
  helpers.debug('got media');
  helpers.debug(media);
  response.render('geo', {
        images: media 
    });
  });
});

//app.listen(settings.appPort);
