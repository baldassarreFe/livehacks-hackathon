var io = require('socket.io-client');

url = '130.237.14.66';
port = 3000;
var socket = io('http://' + url + ':' + port);

socket.on('song start', function () {
    console.log('Song started')
});

socket.on('noteOnScreen', note);

function note(msg) {
    console.log(msg)
}

socket.on('song end', function () {
    console.log('Song end');
    socket.disconnect();
    process.exit(0);
});