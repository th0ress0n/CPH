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


// All dependencies
// ----------------------------------------------------------------------
const si = require('systeminformation');
var five = require('johnny-five');
var PiIO = require('pi-io');
var gpio = require('onoff').Gpio;
var gpio = require("gpio"); // GPIO !!
// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


// CEC utils - Required to detect TV on and off via HDMI ----------------
// ----------------------------------------------------------------------

 
// setInterval(function() {
//     si.graphics().then(data => {
//         console.log("---------")
//         console.log(data.displays.length);
//         console.log(data.displays[0].connection);
//         console.log(data.displays[0].currentRefreshRate);
//     })
// }, 1000)
// End CEC section ------------------------------------------------------
// ----------------------------------------------------------------------




// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
var board = new five.Board({
    io: new PiIO()
});
   
board.on('ready', function() {
    console.log("---GPIO BOARD READY---")
    var proximity = new five.Proximity({
        controller: PiIO.HCSR04, // Custom controller
        triggerPin: 'GPIO23',
        echoPin: 'GPIO24'
    });
   
    proximity.on("change", function() {
        console.log("cm: ", this.cm);
    });
});
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
var pir = new gpio(12, 'in', 'both');
pir.watch(function(err, value) {
    if (value == 1) {
        sendMessage('Intruder alert');
    } else {
        sendMessage('Intruder gone');
    }
});
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------


// wide reference
var sockRef = null; 

// start listening....
server.listen(port, () => { console.log('Server listening at port %d', port) });

// Routing -  Load UI from public root
app.use(express.static(path.join(__dirname, 'public')));



// setup the socket...
io.on('connection', (socket) => {

    sockRef = socket

    socket.volatile.emit('init', Constants.STATE_ROOM_READY);

    // Bounce to startup ->
    socket.on('startup', (data) => {
        console.log("startup "+data)
        socket.emit('init', "init");
    });

    socket.on('state', (data) => {
        console.log("STATE -->> "+data)
        switch(data){
            case Constants.STATE_INIT:
                // configure door sensor and start messuring
                doorWatch()
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


function doorWatch(){
    console.log("DOORWATCH")
    /*
    Setup listener for the GPIO and the door sensor
    incomming signal is located on PIN ?
    */
   

    sockRef.emit('state changed', Constants.STATE_ROOM_READY);
}