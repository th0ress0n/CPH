var Constants = {
    STATE_INIT                              : "INIT",
    STATE_ROOM_READY                        : "ROOM READY",
    STATE_ROOM_ENTERED                      : "ROOM ENTERED",
    STATE_ROOM_ENTERED_UNSEATED             : "ROOM ENTERED UNSEATED",
    STATE_ROOM_USER_SEATED                  : "ROOM USER SEATED",
    STATE_ROOM_USER_SEATED_PHOTO_DONE       : "ROOM USER SEATED PHOTO DONE",
    STATE_ROOM_USER_SEATED_INACTIVE         : "ROOM USER SEATED INACTIVE",
    STATE_ROOM_TV_ACTIVATED                 : "ROOM TV ACTIVATED",
    STATE_ROOM_VIDEO_PLAYING                : "ROOM VIDEO PLAYING",
    STATE_ROOM_VIDEO_FINISHED               : "ROOM VIDEO FINISHED",
    STATE_ROOM_EXIT_SEQUENCE                : "ROOM EXIT SEQUENCE",
    
    SENSOR_DOOR_TRIGGERED                   : "DOOR SENSOR TRIGGERED",
    SENSOR_SEATING_TRIGGERED                : "SEATING SENSOR TRIGGERED",

    API_BASE_PATH                           : "",
    MODE_DEBUG                              : true,

    SENSOR_DOOR_TOLERANCE_DIST              : 3000,
    SENSOR_DOOR_TOL_DURATION                : 1200,

    SENSOR_SEAT_TOLERANCE_DIST              : 3000
}

// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
// var io = require('../..')(server);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var sockRef = null;

// GPIO !!
var gpio = require("gpio");

// start listening....
server.listen(port, () => { console.log('Server listening at port %d', port) });

// Routing -  Load UI from public root
app.use(express.static(path.join(__dirname, 'public')));


// setup the socket...
io.on('connection', (socket) => {

    sockRef = socket

    // Bounce to startup ->
    socket.on('startup', (data) => {
        console.log("startup")
        socket.broadcast.emit('init', {
            init: true
        });
    });

    socket.on('state', (data) => {
        switch(data){
            case Constants.STATE_INIT:
                // configure door sensor and start messuring
                startDoorWatching();
            break;
            case Constants.STATE_ROOM_READY:

            break;
            case Constants.STATE_ROOM_ENTERED:

            break;
            case Constants.STATE_ROOM_ENTERED_UNSEATED:

            break;
            case Constants.STATE_ROOM_USER_SEATED:

            break;
            case Constants.STATE_ROOM_USER_SEATED_PHOTO_DONE:

            break;
            case Constants.STATE_ROOM_TV_ACTIVATED:

            break;
            case Constants.STATE_ROOM_VIDEO_PLAYING:

            break;
            case Constants.STATE_ROOM_VIDEO_FINISHED:

            break;
            case Constants.STATE_ROOM_EXIT_SEQUENCE:

            break;
        }
    });     


    
  
    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        console.log("server disconnected.")
    });
});


function startDoorWatching(){
    console.log("---->>>>")
    sockRef.broadcast.emit('state changed', Constants.STATE_ROOM_READY);
}