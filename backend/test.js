// app sockets
const backendUrl = '130.237.14.66';
const http = require('http');
const server = http.createServer();
server.listen(3002, backendUrl);
const appIo = require('socket.io').listen(server);

var users = [];

appIo.on('connection', function (socket) {
    users.push(socket);
    console.log('Users connected, now ' + users.length);

    socket.emit('song info', {title: 'some song'});

    socket.on('jump', function (msg) {
        console.log(msg);
    });

    socket.on('disconnect', function () {
        users.length--;
        console.log('User disconnected, now ' + users.length);
    });
});