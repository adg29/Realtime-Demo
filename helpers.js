var redis = require('redis');
var settings = require('./settings');
var crypto = require('crypto');
var settings = require('./settings');
var redisClient;

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redisClient =redis.createClient(rtg.port, rtg.hostname);
  redisClient.auth(rtg.auth.split(":")[1]); 
} else {
  redisClient = redis.createClient(settings.REDIS_PORT, settings.REDIS_HOST);
}

redisClient.on("error", function (err) {
  debug("ERROR: redisClient");
  debug(e);
  redisClient.flushDB( function (err, didSucceed) {
    debug('FLUSHDB didSucceed'); // true
    debug(didSucceed); // true
  });
});


settings.moment.fn.fromNoww = function (a) {
    if (Math.abs(settings.moment().diff(this)) <= 1000) { // 1000 milliseconds
        return 'just now';
    }
    if (Math.abs(settings.moment().diff(this)) < 60000) { // 1000 milliseconds
        return Math.floor(Math.abs(settings.moment.duration(this.diff(a)).asSeconds()))  + ' seconds ago';//this.fromNow();
    }
    return this.fromNow(a);
}

/*
function isValidRequest(request) {
    // First, let's verify the payload's integrity by making sure it's
    // coming from a trusted source. We use the client secret as the key
    // to the HMAC.
    var hmac = crypto.createHmac('sha1', settings.CLIENT_SECRET);
    hmac.update(request.rawBody);
    var providedSignature = request.headers['x-hub-signature'];
    var calculatedSignature = hmac.digest(encoding='hex');
    
    // If they don't match up or we don't have any data coming over the
    // wire, then it's not valid.
    return !((providedSignature != calculatedSignature) || !request.body)
}
exports.isValidRequest = isValidRequest;
*/


function isValidRequest(request) {
    // First, let's verify the payload's integrity by making sure it's
    // coming from a trusted source. We use the client secret as the key
    // to the HMAC.
    /*
   To verify that the payload you received comes from us, 
   you can verify the "X-Hub-Signature" header. 
   This will be a SHA-1-signed hexadecimal digest, 
   using your client secret as a key and the payload as the message. 
   Our Ruby and Python libraries provide sample implementations of this check. 
   */
    var hmac = crypto.createHmac('sha1', settings.CLIENT_SECRET);
    hmac.update(request.rawBody);
    var hmacback = crypto.createHmac('sha1', settings.CLIENT_SECRET);
    hmacback.update(request.rawBody[0]);
    var providedSignature = request.headers['x-hub-signature'];
    var calculatedSignature = hmac.digest(encoding='hex');
    var calculatedSignatureBack = hmacback.digest(encoding='hex');
    
    // If they don't match up or we don't have any data coming over the
    // wire, then it's not valid.
    /*
    debug( '!((providedSignature != calculatedSignature) || !request.rawBody)' )
    debug( 'providedSignature != calculatedSignature' )
    debug( providedSignature != calculatedSignature )
    debug( providedSignature )
    debug( calculatedSignature )
    debug( calculatedSignatureBack )
    debug('!request.rawBody')
    debug(!request.rawBody)
    debug(request.rawBody)
    */
    return !((providedSignature != calculatedSignature) || !request.rawBody)
}
exports.isValidRequest = isValidRequest;

function debug(msg) {
  if (settings.debug) {
    console.log(msg);
  }
}
exports.debug = debug;

function processTag(tag, update){
  var path = '/v1/tags/' + update.object_id + '/media/recent/';
  getMinID(tag, function(error, minID){
    var queryString = "?client_id="+ settings.CLIENT_ID;
    if(minID){
      queryString += '&min_id=' + minID;
    } else {
        // If this is the first update, just grab the most recent.
      queryString += '&count=1';
    }
    var options = {
      host: settings.apiHost,
      // Note that in all implementations, basePath will be ''. Here at
      // instagram, this aint true ;)
      path: settings.basePath + path + queryString
    };
    if(settings.apiPort){
        options['port'] = settings.apiPort;
    }

        // Asynchronously ask the Instagram API for new media for a given
        // tag.
    debug("processTac: getting " + path);
    debug("options")
    settings.httpClient.get(options, function(response){
      var data = '';
      response.on('data', function(chunk){
        debug("processTag Got data...");
        data += chunk;
      });
      response.on('end', function(){
        debug("processTag Got end.");
          try {
            var parsedResponse = JSON.parse(data);
          } catch (e) {
              console.log('Couldn\'t parse data. Malformed?');
              return;
          }
        if(!parsedResponse || !parsedResponse['data']){
            console.log('Did not receive data for ' + tag +':');
            console.log(data);
            return;
        }
        setMinID(tag, parsedResponse['data']);
        
        // Let all the redis listeners know that we've got new media.
        try{
          redisClient.publish('channel:' + tag , data);
          debug("*********Published: " + data);
        }catch(e){
          debug("REDIS ERROR: redisClient.publish('channel:' + tag, data)");
          debug(e);

          redisClient.flushDB( function (err, didSucceed) {
            debug('FLUSHDB didSucceed'); // true
            debug(didSucceed); // true
          });
        }
      });
    });
  });
  //debug("Processed " + updates.length + " tag updates");
}
exports.processTag = processTag;


/*

    Each update that comes from Instagram merely tells us that there's new
    data to go fetch. The update does not include the data. So, we take the
    geography ID from the update, and make the call to the API.

*/

function processGeography(geoName, update){
  var path = '/v1/geographies/' + update.object_id + '/media/recent/';
  getMinID(geoName, function(error, minID){
    var queryString = "?client_id="+ settings.CLIENT_ID;
    if(minID){
      queryString += '&min_id=' + minID;
    } else {
        // If this is the first update, just grab the most recent.
      queryString += '&count=1';
    }
    var options = {
      host: settings.apiHost,
      // Note that in all implementations, basePath will be ''. Here at
      // instagram, this aint true ;)
      path: settings.basePath + path + queryString
    };
    if(settings.apiPort){
        options['port'] = settings.apiPort;
    }

        // Asynchronously ask the Instagram API for new media for a given
        // geography.
    debug("processGeography: getting " + path);
    settings.httpClient.get(options, function(response){
      var data = '';
      response.on('data', function(chunk){
        debug("processGeography Got data...");
        data += chunk;
      });
      response.on('end', function(){
        debug("processGeography Got end.");
          try {
            var parsedResponse = JSON.parse(data);
          } catch (e) {
              console.log('Couldn\'t parse data. Malformed?');
              return;
          }
        if(!parsedResponse || !parsedResponse['data']){
            console.log('Did not receive data for ' + geoName +':');
            console.log(data);
            return;
        }
        setMinID(geoName, parsedResponse['data']);
        
        // Let all the redis listeners know that we've got new media.
        try{
          redisClient.publish('channel:' + geoName, data);
          debug("*********Published: " + data);
        }catch(e){
          debug("REDIS ERROR: redisClient.publish('channel:' + geoName, data)");
          debug(e);

          redisClient.flushDB( function (err, didSucceed) {
            debug('FLUSHDB didSucceed'); // true
            debug(didSucceed); // true
          });
        }
      });
    });
  });
  //debug("Processed " + updates.length + " updates");
}
exports.processGeography = processGeography;

function getMedia(callback){
    // This function gets the most recent media stored in redis
  redisClient.lrange('media:objects', 0, 23, function(error, media){


      debug("getMedia: got " + media.length + " items");
      debug('redisMedia')
      // Parse each media JSON to send to callback
      media = media.map(function(json){return JSON.parse(json);});
      callback(error, media);
  });
}
exports.getMedia = getMedia;

/*
    In order to only ask for the most recent media, we store the MAXIMUM ID
    of the media for every geography we've fetched. This way, when we get an
    update, we simply provide a min_id parameter to the Instagram API that
    fetches all media that have been posted *since* the min_id.
    
    You might notice there's a fatal flaw in this logic: We create
    media objects once your upload finishes, not when you click 'done' in the
    app. This means that if you take longer to press done than someone else
    who will trigger an update on your same geography, then we will skip
    over your media. Alas, this is a demo app, and I've had far too
    much red bull – so we'll live with it for the time being.
    
*/

function getMinID(obj_id, callback){
  redisClient.get('min-id:channel:' + obj_id, callback);
}
exports.getMinID = getMinID;

function setMinID(obj_id, data){
    var sorted = data.sort(function(a, b){
        return parseInt(b.id) - parseInt(a.id);
    });
    var nextMinID;
    try {
        nextMinID = parseInt(sorted[0].id);
        redisClient.set('min-id:channel:' + obj_id, nextMinID);
    } catch (e) {
        console.log('Error parsing min ID');
        console.log(sorted);
    }
}
exports.setMinID = setMinID;
