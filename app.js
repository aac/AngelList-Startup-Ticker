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

var lastStartup;

io.sockets.on('connection', function (socket) {
	socket.on('connect', function(){
		if (!(lastStartup === undefined)){
		    socket.emit('startup', lastStartup);
		}
	    });
	/*
	var startups = setInterval(function () {
		socket.emit('startup', { "id": 1124,
					 "hidden": false,
					 "name": "500 Startups (Fund)",
					 "angellist_url": "http://angel.co/500-startups-fund",
					 "logo_url": "https://s3.amazonaws.com/photos.angel.co/startups/1124-medium?1300233013",
					 "product_desc": "500 Startups is a next-generation venture capital seed fund...",
					 "follower_count": 597,
					 "company_url": "http://500startups.com"});
	    }, 5000);
	
	socket.on('disconnect', function(){
		clearInterval(startups);
	    });
	*/
    });

var request = require('request');

function getAndSendNewStartups(){
    function processStartups(startups)
    {
	startups.filter(function(s){return (s.hidden === false) && ((lastStartup === undefined) || (s.id > lastStartup.id));}).reverse().forEach(function(s){
		io.sockets.emit('startup', s);
	    });
	lastStartup = startups[0];
    }
    
    //console.log('requesting startups');
    request('http://api.angel.co/1/tags/9217/startups/', function (error, response, body) {
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