var 
    settings = require('./settings'),
    helpers = require('./helpers'),
    redis = require('redis'),
    fs = require('fs'),
    jade = require('jade'),
    io = require('socket.io'),
    app = settings.app,
    subscriptionPattern = 'channel:*';
    socket = io.listen(settings.server),
    si_clients = {};

// assuming io is the Socket.IO server object
socket.configure(function () { 
  helpers.debug('socket configure xhr-polling');
  socket.set("transports", ["xhr-polling"]); 
  socket.set("polling duration", 10); 
});

socket.sockets.on('connection', function (socket) {
  helpers.debug("DONE: sockets connection")
  si_clients[socket.id] = socket;
});

// We use Redis's pattern subscribe command to listen for signals
// notifying us of new updates.


var redisClient;
if (process.env.REDISTOGO_URL) {
  // inside if statement
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  redisClient = redis.createClient(rtg.port, rtg.hostname);
  redisClient.auth(rtg.auth.split(":")[1]); 
} else {
  redisClient = redis.createClient(settings.REDIS_PORT, settings.REDIS_HOST);
}

redisClient.on("error", function (err) {
  helpers.debug("ERROR: redisClient subscriptions.js");
  helpers.debug(e);
  redisClient.lrem('media:objects',-500,function (err, didSucceed) {
    helpers.debug('lrendidSucceed'); // true
    helpers.debug(JSON.stringify(didSucceed)); // true
  });
});


var pubSubClient;
if (process.env.REDISTOGO_URL) {
  // inside if statement
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  pubSubClient = redis.createClient(rtg.port, rtg.hostname);
  pubSubClient.auth(rtg.auth.split(":")[1]); 
} else {
  pubSubClient = redis.createClient(settings.REDIS_PORT, settings.REDIS_HOST);
}

pubSubClient.on("error", function (err) {
  debug("ERROR: pubsubClient subscriptions.js");
  debug(e);
});


pubSubClient.psubscribe(subscriptionPattern);


pubSubClient.on('pmessage', function(pattern, channel, message){
  //helpers.debug("Handling " + pattern + " pmessage: " + message);

  /* Every time we receive a message, we check to see if it matches
     the subscription pattern. If it does, then go ahead and parse it. */

  if(pattern == subscriptionPattern){
      try {
        var data = JSON.parse(message)['data'];
        
        // Channel name is really just a 'humanized' version of a slug
        // san-francisco turns into san francisco. Nothing fancy, just
        // works.
        var channelName = channel.split(':')[1].replace(/-/g, ' ');
      } catch (e) {
          helpers.debug('catch channel parse');
          helpers.debug(e);
          return;
      }
    
    // Store individual media JSON for retrieval by homepage later
    helpers.debug('Store individual media JSON for retrieval by homepage later');
    helpers.debug(channelName);
    //helpers.debug(data);
    for(index in data){
        var media = data[index];
        helpers.debug('indexmedia');
        helpers.debug(media);
        media.meta = {};
        media.meta.location = channelName;
        var redis_length;
        redisClient.llen('media:objects',function(err,len){
          redis_length = len;
          helpers.debug('redis_len ' + redis_length);
          if(redis_length>1700){
            redisClient.ltrim("media:objects",0,1200,function (err, didSucceed) {
              helpers.debug('ltrimDidSucceed'); // true
              helpers.debug(JSON.stringify(err)); // true
              helpers.debug(didSucceed); // true
            });
          }
        });
        redisClient.lpush('media:'+channelName, JSON.stringify(media),function(err,result){
            helpers.debug('lpushResult'); // true
            helpers.debug(JSON.stringify(err)); // true
            helpers.debug(result); // true
          });
    }
    
    // Send out whole update to the listeners
    var update = {
      'type': 'newMedia',
      'media': data,
      'channelName': channelName
    };
    for(sessionId in si_clients){
      try{
        helpers.debug('try socket clients send') 
        helpers.debug(sessionId) 
        helpers.debug(update) 
        var client = si_clients[sessionId];
        client.send(JSON.stringify(update));
      }catch (e) {
        helpers.debug('catch socket clients send') 
        helpers.debug(sessionId) 
        helpers.debug(update) 
        helpers.debug(e) 
      }
    }
  }
});
