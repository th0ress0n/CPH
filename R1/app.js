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
// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// ------- MOTION DETECTION
var pir = new gpio(19, 'in', 'both');
var motionlessInt = null
const MOTIONLESS_TIMER = 60000; // One minute to trip unless cancelled
// ------- PROXIMITY DETECTION
var board = new five.Board({ io: new PiIO() });
var proximityStack = []







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

                board.on('ready', function() {
                    console.log("---GPIO BOARD READY---")
                    var proximity = new five.Proximity({
                        controller: PiIO.HCSR04, // Custom controller
                        triggerPin: 'GPIO23',
                        echoPin: 'GPIO24'
                    });
                    
                    proximity.on("change", function() {
                        // console.log("Distance cm: ", this.cm);

                        // Get 10 messurements and check the average, if average is less than the desired distance , the user has sat down
                        proximityStack.push(this.cm);
                        if(proximityStack.length>10){proximityStack.shift()};
                        var total = 0;
                        for(var i = 0; i < proximityStack.length; ++i){ total += proximityStack[i] };
                        console.log(total+" on average /10 : "+total/proximityStack.length);

                    });
                });
                
            break;
            case Constants.STATE_ROOM_ENTERED_UNSEATED:

            break;
            case Constants.STATE_ROOM_USER_SEATED:
                // once user is seated we dont need the motion sensor anymore
                pir.unwatch(); // stop listening on the motion detection.

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


function userLeft(){
    // set interval when motion is not present. If motionless for more than 1 minute, assume the user left the room
    motionlessInt = setInterval( 
        function(){ 
            // cancel room entry and revert back to idle
            
        ); 
    }, MOTIONLESS_TIMER);
}


function doorWatch(){
    console.log("DOORWATCH")
    /*
    Setup listener for the GPIO and the door sensor
    incomming signal is located on PIN ?
    */
   
   pir.watch(function(err, value) {
        if (value == 1) {
            if(Constants.STATE_ROOM_READY){
                console.log("Motion Detected")
                sockRef.emit('state changed', Constants.STATE_ROOM_ENTERED);
            }
            
        } else {
            if(Constants.STATE_ROOM_READY){
                console.log("No Motion present");
            }
        }
    });
  

    sockRef.emit('state changed', Constants.STATE_ROOM_READY);
}