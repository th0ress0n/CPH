var Constants = {
    STATE_INIT                              : "INIT",
    STATE_RESET                             : "RESET",
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
    
    CAMERA_SNAP                             : "CAMERA SNAP PHOTO",
    ACTIVATE_PROXIMITY_SENSOR               : "ACTIVATE PROXIMITY SENSOR",
    DEACTIVATE_PROXIMITY_SENSOR             : "DEACTIVATE PROXIMITY SENSOR",
    SENSOR_DOOR_TRIGGERED                   : "DOOR SENSOR TRIGGERED",
    SENSOR_SEATING_TRIGGERED                : "SEATING SENSOR TRIGGERED",
    ACTIVATE_TV_SENSOR                      : "ACTIVATE TV SENSOR",

    TV_STATE_HDMI_UNPLUGGED                 : "[I] HDMI cable is unplugged",
    TV_STATE_HDMI_ACTIVE                    : "[I] HDMI is attached",

    API_BASE_PATH                           : "",
    MODE_DEBUG                              : true,

    SENSOR_DOOR_TOLERANCE_DIST              : 3000,
    SENSOR_DOOR_TOL_DURATION                : 1200,

    SENSOR_SEAT_TOLERANCE_DIST              : 40
}


// All dependencies
// ----------------------------------------------------------------------
const si = require('systeminformation');
var five = require('johnny-five');
var PiIO = require('pi-io');
var gpio = require('onoff').Gpio;

var RaspiCam = require("raspicam");

// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var currentState = Constants.STATE_INIT;

// ------- MOTION DETECTION
var pir = new gpio(19, 'in', 'both');
var motionlessInt = null
const MOTIONLESS_TIMER = 60000; // One minute to trip unless cancelled
// ------- PROXIMITY DETECTION
var board = new five.Board({ io: new PiIO() });
var proximityStack = []
var averageDist = 0;
// ------- CAMERA
var camera = null;


// TV state -------------------------------------------------------------
var tvOn = null
var child_process = require('child_process');
var cmd = 'tvservice';
var value = ['-M'];
var opt = { };
var child = child_process.spawn(cmd, value, opt);

child.stdout.on('data', function (data) { console.log('stdout data' + data) });

child.stderr.on('data', function (data) {
    if(Constants.MODE_DEBUG){ console.log('HDMI triggered: '+data) };
    switch(data.toString()){
        case Constants.TV_STATE_HDMI_ACTIVE:
            if(Constants.MODE_DEBUG){ console.log("TV ON !!!!!") };
            tvOn = true;
            if( currentState==Constants.STATE_ROOM_USER_SEATED_PHOTO_DONE  ){
                sockRef.emit('state changed', Constants.STATE_ROOM_TV_ACTIVATED);
            }
        break;
        case Constants.TV_STATE_HDMI_UNPLUGGED:
            if(Constants.MODE_DEBUG){ console.log("TV OFF !!!!!") };
            tvOn = false
        break;
    }
});
child.on('close', function (code) { console.log("child - on close") });
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
var proximity = new five.Proximity({
    controller: PiIO.HCSR04, // Custom controller
    triggerPin: 'GPIO23',
    echoPin: 'GPIO24'
});

board.on('ready', function() {
    if(Constants.MODE_DEBUG){ console.log("---GPIO BOARD READY---") };
    proximity.on("change", function() {
        // console.log("Distance cm: ", this.cm);
        if(currentState == Constants.STATE_ROOM_ENTERED_UNSEATED){
            // Get 10 messurements and check the average, if average is less than the desired distance , the user has sat down
            proximityStack.push(this.cm);
            if(proximityStack.length>10){proximityStack.shift()};
            var total = 0;
            for(var i = 0; i < proximityStack.length; ++i){ total += proximityStack[i] };
            averageDist = Math.round(total/proximityStack.length);
            console.log(total+" on average /10 : "+averageDist);
            // Meassure towards the config tolerance
            if(averageDist!=0 && averageDist<Constants.SENSOR_SEAT_TOLERANCE_DIST){
                // User is seated, switch state and proceed.
                sockRef.emit('sensor event', Constants.SENSOR_SEATING_TRIGGERED);
            }
        }
    });
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

    // Bounce to startup ->
    socket.on('startup', (data) => {
        if(Constants.MODE_DEBUG){ console.log("startup "+data) };
        socket.emit('init', "init");
    });

    socket.on('state', (data) => {
        if(Constants.MODE_DEBUG){ console.log("STATE -->> "+data) };

        currentState = data;

        switch(data){
            case Constants.STATE_INIT:
                // configure door sensor and start messuring
                sockRef.emit('state changed', Constants.STATE_ROOM_READY);
            break;
            case Constants.STATE_ROOM_READY:
                doorWatch()
            break;
            case Constants.STATE_ROOM_ENTERED:
                // handled by sensor.
            break;
            case Constants.STATE_ROOM_ENTERED_UNSEATED:
                // State bounced from Client
            break;
            case Constants.STATE_ROOM_USER_SEATED:
                // once user is seated we dont need the motion sensor anymore
                pir.unwatch(); // stop listening on the motion detection.
            break;
            case Constants.STATE_ROOM_USER_SEATED_PHOTO_DONE:
                // Nothing on serverside for this state
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

    socket.on('sensor event', (data) => {
        switch(data){
            case Constants.ACTIVATE_PROXIMITY_SENSOR:

            break;
            case Constants.CAMERA_SNAP:
                snapPhoto();
            break;
            case Constants.ACTIVATE_TV_SENSOR:
                
            break;
        }
    });

    
  
    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        if(Constants.MODE_DEBUG){ console.log("server disconnected.") };
    });
});



// ------ CAMERA  -------------------------------------------------------------------------

function snapPhoto(){
    var timestamp = new Date().getTime().toString();
    var camera = new RaspiCam({  
        mode: 'photo',
        encoding: 'png',
        output: './public/img/'+timestamp+'_img.png',
        brightness: 60,
        timeout: 0,
        opacity: 0
    });
    
    //to take a snapshot, start a timelapse or video recording
    camera.start( );
    
    camera.on("start", function(){
        //do stuff
    });
    
    //listen for the "read" event triggered when each new photo/video is saved
    camera.on("read", function(err, timestamp, filename){ 
        //get the photo and pass to client
        if(filename){
            sockRef.emit('load photo', {time: timestamp, file: filename} );
            camera.stop();
        }
        if(err){
            if(Constants.MODE_DEBUG){ console.log("Error taking photo: "+err) };
        }
    });
    
    
    camera.on("stop", function(){
        //listen for the "stop" event triggered when the stop method was called
    });
    
    
    camera.on("exit", function(){
        //listen for the process to exit when the timeout has been reached
    });
}


// ------ DOOR  -------------------------------------------------------------------------

function userLeft(){
    // set interval when motion is not present. If motionless for more than 1 minute, assume the user left the room
    motionlessInt = setInterval( function(){ sockRef.emit('state changed', Constants.STATE_RESET) }, MOTIONLESS_TIMER);
}

function doorWatch(){
    console.log("DOORWATCH : "+currentState)
    /*
    Setup listener for the GPIO and the door sensor
    incomming signal is located on PIN ?
    */
   pir.watch(function(err, value) {
       if (value == 1) {
            if(currentState == Constants.STATE_ROOM_READY || currentState == Constants.STATE_ROOM_ENTERED){
                clearInterval(motionlessInt);
                if(Constants.MODE_DEBUG){ console.log("Motion Detected") };
                sockRef.emit('sensor event', Constants.SENSOR_DOOR_TRIGGERED);
            }
            
        } else {
            if(currentState == Constants.STATE_ROOM_READY || currentState == Constants.STATE_ROOM_ENTERED){
                if(Constants.MODE_DEBUG){ console.log("No Motion present") };
                if(motionlessInt!=null){ userLeft() };
            }
        }
    });

}