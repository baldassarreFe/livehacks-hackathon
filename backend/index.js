// midi
const song = require('./midi/song.js');
const track = song.tracks[1];
var notes = track.notes;

var startTime = null;
boxesToShow = {};
groupedNotes = {};

function chooseBoxColor(note) {
    switch (note.name[0]) {
        case 'C':
        case 'E': return 'red';
        case 'G':
        case 'B': return 'blue';
        case 'D':
        case 'F': return 'yellow';
        case 'A': return 'green';
    }
}

notes.forEach(function (n) {
    if (n.name === undefined)
        return;

    n.time = Math.round(1000 * n.time);
    n.ok = true;

    var shiftedTime = n.time + 4000 + 2000;
    if (!groupedNotes[shiftedTime])
        groupedNotes[shiftedTime] = [];
    groupedNotes[shiftedTime].push(n);

    var flooredTime = Math.floor(n.time / 500) * 500 + 2000;
    if (!boxesToShow[flooredTime])
        boxesToShow[flooredTime] = {};
    var color = chooseBoxColor(n);
    n.boxId = flooredTime;
    boxesToShow[flooredTime][color] = {duration: 0.5, id: flooredTime};
    //Math.max(n.duration, boxesToShow[flooredTime][color]);
});

// screen socket
const backendUrl = '130.237.14.66';
const http = require('http');
const screenServer = http.createServer();
screenServer.listen(3000, backendUrl);
const screenIo = require('socket.io').listen(screenServer);

screenSocket = null;
screenIo.on('connection', function (socket) {
    console.log('Screen connected');
    screenSocket = socket;

    if (shouldStartSong())
        startSong();
});

// app sockets
const server = http.createServer();
server.listen(3001, backendUrl);
const appIo = require('socket.io').listen(server);

var users = [];
var userColors = {};
var userJumps = {};

appIo.on('connection', function (socket) {
    users.push(socket);
    console.log('Users connected, now ' + users.length);

    // socket.emit('song info', {title: 'some song'});

    socket.on('user info', function(msg) {
       userColors[msg.id] = msg.color
    });

    if (shouldStartSong())
        startSong();

    socket.on('jump', function (msg) {
        /*
        msg = eval(msg);
        console.log(msg, msg['time'], parseInt(msg['time']));
        ceiledJumpTime = Math.ceil((parseInt(msg['time']) - startTime) / 500) * 500;
        if (! userJumps[ceiledJumpTime])
            userJumps[ceiledJumpTime] = {red: 0, blue: 0, yellow: 0, green: 0};
        userJumps[ceiledJumpTime][userColors[msg['deviceID']]]++;
        console.log(ceiledJumpTime, userJumps[ceiledJumpTime])
        */
    });

    socket.on('disconnect', function () {
        users.length--;
        console.log('User disconnected, now ' + users.length);
    });
});

function shouldStartSong() {
    return screenSocket !== null && users.length >= 1
}

// song events

function startSong() {
    for (var i = 0; i < users.length; i++)
        users[i].emit('song start');
    screenSocket.emit('song start');

    startTime = Date.now();
    setInterval(sendToScreen, 1);
    setTimeout(endSong, 90000);
}

function sendToScreen() {
    var delta = Date.now() - startTime;
    if (boxesToShow.hasOwnProperty(delta)) {
        screenSocket.emit('boxOnScreen', boxesToShow[delta])
    }

    if (boxesToShow.hasOwnProperty(delta - 4000) && userJumps.hasOwnProperty(delta)) {
        var boxes = boxesToShow[delta-4000];
        var jumps = userJumps[delta];

        console.log(boxes, jumps);

        for (var color in boxes) {
            if (! boxes.hasOwnProperty(color))
                continue;
            if ((boxes[color].duration > 0) === (jumps[color] > 0)){
                console.log('ok')
            }
            else {
                console.log('no')
            }
        }
    }

    if (groupedNotes.hasOwnProperty(delta)) {
        screenSocket.emit('noteOnScreen', groupedNotes[delta])
    }
}

function endSong() {
    for (var i = 0; i < users.length; i++) {
        users[i].emit('song end');
        users[i].disconnect();
    }
    screenSocket.emit('song end');
    screenSocket.disconnect();
    process.exit(0);
}