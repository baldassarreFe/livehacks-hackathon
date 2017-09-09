var io = require('socket.io-client');

var socket = io('http://localhost:3000');

songStart = 0;
uuid = uuidv4();
colors = ['red', 'green', 'blue'];
color = colors[Math.floor(Math.random() * colors.length)];

socket.on('song start', function(msg) {
    songStart = Date.now();
    userJumping()
});

socket.on('song end', function (msg) {
    socket.disconnect();
    process.exit(0);
});

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function userJumping() {
    if (Math.random() >= 0.2)
        socket.emit('jump', {
            color: color,
            id: uuidv4(),
            time: Date.now() - songStart
        });
    setTimeout(userJumping, 1000 + Math.floor(100 * Math.random()))
}
