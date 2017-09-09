// midi
const song = require('./midi/song.js');
const track = song.tracks[1];
var notes = track.notes;

groupedNotes = {};
notes.forEach(function (n) {
    n.time = Math.round(1000 * n.time);
    if (!groupedNotes[n.time])
        groupedNotes[n.time] = [];
    groupedNotes[n.time].push(n)
});

var startTime = null;

// screen socket
const http = require('http');
const screenServer = http.createServer();
screenServer.listen(3000, '130.237.14.66');
const screenIo = require('socket.io').listen(screenServer);

screenSocket = null;
screenIo.on('connection', function (socket) {
    console.log('Screen connected');
    screenSocket = socket;

    screenSocket.emit('noteOnScreen',
        [{name: 'C4', duration: 5},
            {name: 'G4', duration: 1},
            {name: 'E4', duration: 2}]);

    if (shouldStartSong())
        startSong();
});

function sendNotes() {
    delta = Date.now() - startTime;
    if (groupedNotes.hasOwnProperty(delta)) {
        console.log(delta); //, notesNow.map(function(x) {return [x.name, x.duration]}));
        screenSocket.emit('noteOnScreen', groupedNotes[delta])
    }
}

// app sockets
const server = http.createServer();
server.listen(3001, '130.237.14.66');
const appIo = require('socket.io').listen(server);

var users = [];
receivedJumps = 0;

appIo.on('connection', function (socket) {
    users.push(socket);
    console.log('Users connected, now ' + users.length);

    socket.emit('song info', {title: 'some song'});

    if (shouldStartSong())
        startSong();

    socket.on('jump', function (msg) {
        console.log(msg);
        receivedJumps++;

        screenSocket.emit('noteOnScreen', {key: 'C#4', velocity: '8n'});
        screenSocket.emit('noteOnScreen', {key: 'C4', velocity: '8n'});

        if (receivedJumps > 10)
            endSong()
    });

    socket.on('disconnect', function () {
        users.length--;
        console.log('User disconnected, now ' + users.length);
    });
});

function shouldStartSong() {
    return screenSocket !== null && users.length >= 0
}

function startSong() {
    for (var i = 0; i < users.length; i++)
        users[i].emit('song start');
    screenSocket.emit('song start');

    startTime = Date.now();
    setInterval(sendNotes, 1)
}

function endSong() {
    for (var i = 0; i < users.length; i++)
        users[i].emit('song end');
    screenSocket.emit('song end');
    process.exit(0);
}