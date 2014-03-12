/*

    Instagram real-time updates demo app.

*/


var url = require('url'),
  redis = require('redis'),
  http = require('request'),
  settings = require('./settings'),
  helpers = require('./helpers'),
  subscriptions = require('./subscriptions');
var buffertools = require('buffertools');

var app = settings.app;
var server = settings.server;

app.get('/proxied_image/:image_url', function(req, res){
  helpers.debug("Starting proxy");
  var image_url = req.params.image_url;
 
  http({url:image_url,encoding:null},function(e,r,b){
      var encoding = (r.headers['content-type'].indexOf('image') === -1) ? 'utf8' : 'binary';
      res.end(b, encoding);
    });
});

app.get('/callbacks/geo/:geoName', function(request, response){
    // The GET callback for each subscription verification.
  helpers.debug("GET " + request.url); 
  var params = url.parse(request.url, true).query;
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.get('/callbacks/tag/:tag', function(request, response){
    // The GET callback for each subscription verification.
  helpers.debug("GET " + request.url); 
  var params = url.parse(request.url, true).query;
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.post('/callbacks/tag/:tag', function(request, response){
  helpers.debug("PUT /callbacks/tag/" + request.params.tag);
   // The POST callback for Instagram to call every time there's an update
   // to one of our subscriptions.
    
   // First, let's verify the payload's integrity
   if(!helpers.isValidRequest(request)) {
     helpers.debug('request validity questionable')
     //response.send('FAIL');
     //return;
   }
    
    // Go through and process each update. Note that every update doesn't
    // include the updated data - we use the data in the update to query
    // the  API to get the data we want.
  var updates = JSON.parse(request.rawBody);
  var tag = request.params.tag;
  helpers.debug('tag')
  helpers.debug(tag)
  for(index in updates){
    var update = updates[index];
    helpers.debug('updateLoop')
    helpers.debug(update)
    if(update['object'] == "geography"){
      helpers.processGeography(geoName, update);
    }
    else if(update['object'] == "tag"){
      helpers.processTag(tag, update);
    }
  }
  response.send('OK');
});

app.post('/callbacks/geo/:geoName', function(request, response){
  helpers.debug("PUT /callbacks/geo/" + request.params.geoName);
   // The POST callback for Instagram to call every time there's an update
   // to one of our subscriptions.
    
   // First, let's verify the payload's integrity
   if(!helpers.isValidRequest(request)) {
     helpers.debug('request validity questionable')
     //response.send('FAIL');
     //return;
   }
    
    // Go through and process each update. Note that every update doesn't
    // include the updated data - we use the data in the update to query
    // the  API to get the data we want.
  var updates = JSON.parse(request.rawBody);
  console.log(request.rawBody)
  console.log(request.body)
  var geoName = request.params.geoName;
  helpers.debug('geoNameParams')
  helpers.debug(geoName)
  for(index in updates){
    var update = updates[index];
    helpers.debug('updateLoop')
    helpers.debug(update)
    if(update['object'] == "geography"){
      helpers.processGeography(geoName, update);
    }
    else if(update['object'] == "tag"){
      helpers.processTag(geoName, update);
    }
  }
  response.send('OK');
});

app.post('/webhooks', function(request, response){
  helpers.debug("PUT /webhooks/" + request.params);
  response.send('OK');
});

var getMedia = function(hashtag){
}


// Render the home page
app.get('/updates/:hashtag', function(request, response){
  var media_res = [];
  var hashtag_resp = request.params.hashtag;
  helpers.getMedia(hashtag_resp,function(error, media){
    media_res = typeof media !== 'undefined' ? media : [].reverse();
    for(var m in media_res){
      media_res[m].images.low_resolution.url = "/proxied_image/" + encodeURIComponent(media_res[m].images.low_resolution.url);
    }

    response.render('geo', {
          images: media_res,
          hashtag: hashtag_resp
    });
  });
});

app.get('/', function(request, response){ 
  var media_res = [];
  var hashtag_resp = "armoryshow";
  helpers.getMedia(hashtag_resp,function(error, media){
    media_res = typeof media !== 'undefined' ? media : [].reverse();
    for(var m in media_res){
      media_res[m].images.low_resolution.url = "/proxied_image/" + encodeURIComponent(media_res[m].images.low_resolution.url);
    }

    response.render('geo', {
          images: media_res,
          hashtag: hashtag_resp
    });
  });
});

// // Render the home page
// app.get('/updates/:hashtag', function(request, response){
//   response.render('geo', {
//         images: getMedia(request.params.hashtag)
//   });
// });
// app.get('/', function(request, response){ 
//   response.render('geo', {
//         images: getMedia('armoryshow')
//   });
// });
