var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

app.get('/', function (req, res) {
    res.send('<h1>Hello world</h1>');
});

io.on('connection', function (socket) {
    users.push(socket)
    console.log('Users connected, now ' + users.length);

    receivedJumps = 0;
    if (users.length >= 2)
        socket.emit('song start');

    socket.on('jump', function (msg) {
        console.log(msg);
        receivedJumps++;
        if (receivedJumps > 10)
            endSong()
    });

    socket.on('disconnect', function () {
        users.length--;
        console.log('User disconnected, now ' + users.length);
    });
});

function endSong() {
    for (var i = 0; i < users.length; i++)
        users[i].emit('song end');
    process.exit(0);
}

http.listen(3000, function () {
    console.log('listening on *:3000');
});