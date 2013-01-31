// http://expressjs.com/migrate.html
var express = require('express');

var app = express();
var server = require('http').createServer(app);

exports.app = app;
exports.server = server;

exports.appPort = process.env.IG_APP_PORT || 3000;
exports.CLIENT_ID = process.env.IG_CLIENT_ID || 'CLIENT_ID'
exports.CLIENT_SECRET = process.env.IG_CLIENT_SECRET || 'CLIENT_SECRET';
exports.httpClient = (process.env.IG_USE_INSECURE ? require('http') : require('https'));
exports.apiHost = process.env.IG_API_HOST || 'api.instagram.com';
exports.apiPort = process.env.IG_API_PORT || null;
exports.basePath = process.env.IG_BASE_PATH || '';
exports.REDIS_PORT = 6486;
exports.REDIS_HOST = '127.0.0.1';
exports.debug = true;

server.listen(exports.appPort);

app.set('view engine', 'jade');

app.configure(function(){
    app.use(express.methodOverride());
	// For Express 3 (won't work with express 2.x)
	app.use (function(req, res, next) {
	    console.log('mw collecting data');
	    var data = '';
	    req.setEncoding('utf8');
	    req.on('data', function(chunk) { 
	       data += chunk;
	    });
	    req.on('end', function() {
	    	console.log('mw end collecting data');
	        console.log(data);
	    	console.log('/mw end collecting data');
	        req.rawBody = data;
	        next();
	    });
	});

    app.use(app.router);
    app.use(express.static(__dirname + '/public/'));
});
app.configure('development', function(){
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});
