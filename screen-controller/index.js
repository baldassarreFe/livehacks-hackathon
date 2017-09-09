var express 	= require('express');
var app			= express();
var http 		= require('http').Server(app);
var io 			= require('socket.io')(http);
var port 		= process.env.PORT || 8080;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
	app.use(express.static(__dirname + '/'));
});

http.listen(port, function(){
	console.log('listening on *:' + port);
});