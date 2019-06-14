var Constants = {
  STATE_INIT                              : "INIT",
  STATE_RESET                             : "RESET",
  STATE_ROOM_READY                        : "ROOM READY",
  STATE_ROOM_ENTERED                      : "ROOM ENTERED",
  STATE_ROOM_LIGHT_ACTIVATED              : "ROOM LIGHT ACTIVATED",
  STATE_ROOM_TV_ACTIVATED                 : "ROOM TV ACTIVATED",
  STATE_ROOM_AC_ACTIVATED                 : "ROOM AC ACTIVATED",
  STATE_ROOM_EXIT_SEQUENCE                : "ROOM EXIT SEQUENCE",

  ACTIVATE_PROXIMITY_SENSOR               : "ACTIVATE PROXIMITY SENSOR",
  DEACTIVATE_PROXIMITY_SENSOR             : "DEACTIVATE PROXIMITY SENSOR",
  SENSOR_DOOR_TRIGGERED                   : "DOOR SENSOR TRIGGERED",
  SENSOR_SEATING_TRIGGERED                : "SEATING SENSOR TRIGGERED",
  ACTIVATE_TV_SENSOR                      : "ACTIVATE TV SENSOR",
  ACTIVATE_AC_SENSOR                      : "ACTIVATE AC SENSOR",

  API_BASE_PATH                           : "",
  MODE_DEBUG                              : true,

  AUDIO_TURN_ON_LIGHT                     : "TURN ON LIGHT",
  TRACK_TURN_ON_LIGHT                     : "./audio/Please turn on the light.mp3",
  AUDIO_TURN_ON_AC                        : "TURN ON AC",
  TRACK_TURN_ON_AC                        : "./audio/Please turn on the air conditioning.mp3",
  AUDIO_ACTIVATE_TV_ROOM_2                : "TV ROOM 2",
  TRACK_ACTIVATE_TV_ROOM_2                : "./audio/Please turn on the television..mp3",
  AUDIO_PLEASE_EXIT_ROOM_2                : "EXIT ROOM 2",
  TRACK_PLEASE_EXIT_ROOM_2                : "./audio/Please exit the room.mp3",

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
var RaspiCam = require("raspicam");

// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

var currentState = Constants.STATE_INIT;

// ------- Light Detection 
var lightDec = new gpio(4, 'in', 'both');

// ------- MOTION DETECTION
var pir = new gpio(19, 'in', 'both');
var motionlessInt = null
const MOTIONLESS_TIMER = 60000; // One minute to trip unless cancelled
// ------- PROXIMITY DETECTION
var board = new five.Board({ io: new PiIO() });
var proximityStack = []
var averageDist = 0;


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
          if( currentState==Constants.STATE_ROOM_LIGHT_ACTIVATED  ){
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
              doorWatch();
          break;
          case Constants.STATE_ROOM_ENTERED:
              // handled by sensor.
              pir.unwatch();
          break;
          case Constants.STATE_ROOM_LIGHT_ACTIVATED:
              // handled by sensor.
          break;
          case Constants.STATE_ROOM_TV_ACTIVATED:
              
          break;
          case Constants.STATE_ROOM_AC_ACTIVATED:
              sockRef.emit('state changed', Constants.STATE_ROOM_EXIT_SEQUENCE);
          break;
          case Constants.STATE_ROOM_EXIT_SEQUENCE:

          break;
      }
  });

  socket.on('sensor event', (data) => {
      switch(data){
          case Constants.ACTIVATE_PROXIMITY_SENSOR:

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


// ------ LIGHT  -------------------------------------------------------------------------
lightDec.watch(function(err, value) {
  if (value == 1) {
    if( currentState == Constants.STATE_ROOM_ENTERED ){
      console.log("LIGHT OFF");
    }
  } else {
    if( currentState == Constants.STATE_ROOM_ENTERED ){
      console.log("LIGHT ON");
      sockRef.emit('state changed', Constants.STATE_ROOM_LIGHT_ACTIVATED);
    }
  }
});


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