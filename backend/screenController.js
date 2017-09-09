var io = require('socket.io-client');

backendUrl = '130.237.14.66';
port = 3000;
var socket = io('http://' + backendUrl + ':' + port);

socket.on('song start', function () {
    console.log('Song started')
});

socket.on('noteOnScreen', note);
socket.on('boxOnScreen', box);

function note(msg) {
    console.log(msg)
}

function box(msg) {
    console.log(msg)
}

socket.on('song end', function () {
    console.log('Song end');
    socket.disconnect();
    process.exit(0);
});