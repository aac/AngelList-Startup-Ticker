var express = require('express');
var app = express.createServer()
    , io = require('socket.io').listen(app);
var http = require('http');

io.set('log level', 1);

app.configure(function(){
	app.use(express.static(__dirname + '/public'));
    });

app.listen(3000);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
    });

var lastStartupId;
var lastVisibleStartup;

io.sockets.on('connection', function (socket) {
	if (!(lastVisibleStartup === undefined)){
	    socket.emit('startup', lastVisibleStartup);
	}
    });

var request = require('request');

function getAndSendNewStartups(){
    function processStartups(startups)
    {
	var visibleStartups = startups.filter(function(s){
		return !s.hidden && ((lastStartupId === undefined) || s.id > lastStartupId);
	    });
	lastStartupId = startups[0].id;

	if (visibleStartups.length > 0){
	    lastVisibleStartup = visibleStartups[0];

	    visibleStartups.reverse().forEach(function(s){
		    io.sockets.emit('startup', s);
		});
	}
    }
    
    //console.log('requesting startups');
    request({url: "http://api.angel.co/1/tags/1643/startups"}, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
		processStartups(JSON.parse(body).startups);
	    }
	    else {
		console.log('error' + error);
	    }
	});
}

setInterval(function(){
	getAndSendNewStartups();
    }, 3000);//300000);