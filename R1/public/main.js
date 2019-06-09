$(function() {
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

        AUDIO_PLEASE_SIT_ROOM_1                 : "SIT DOWN ROOM 1",
        TRACK_PLEASE_SIT_ROOM_1                 : "./audio/Please take a seat.mp3",
        AUDIO_PLEASE_EXIT_ROOM_1                : "EXIT ROOM 1",
        TRACK_PLEASE_EXIT_ROOM_1                : "./audio/Please exit the room.mp3",
        AUDIO_ACTIVATE_TV_ROOM_1                : "TV ROOM 1",
        TRACK_ACTIVATE_TV_ROOM_1                : "./audio/Please turn on the television..mp3",
        AUDIO_TURN_ON_LIGHT                     : "TURN ON LIGHT",
        TRACK_TURN_ON_LIGHT                     : "./audio/Please turn on the light.mp3",
        AUDIO_TURN_ON_AC                        : "TURN ON AC",
        TRACK_TURN_ON_AC                        : "./audio/Please turn on the air conditioning.mp3",
        AUDIO_ACTIVATE_TV_ROOM_2                : "TV ROOM 2",
        TRACK_ACTIVATE_TV_ROOM_2                : "./audio/Please turn on the television..mp3",
        AUDIO_PLEASE_SIT_ROOM_2                 : "SIT DOWN ROOM 2",
        TRACK_PLEASE_SIT_ROOM_2                 : "./audio/Please take a seat.mp3",
        AUDIO_PLEASE_EXIT_ROOM_2                : "EXIT ROOM 2",
        TRACK_PLEASE_EXIT_ROOM_2                : "./audio/Please exit the room.mp3",

        SENSOR_DOOR_TOLERANCE_DIST              : 3000,
        SENSOR_DOOR_TOL_DURATION                : 1200,

        SENSOR_SEAT_TOLERANCE_DIST              : 3000
    }
    
    // Initialize variables
    var $window = $(window);

    var $debug = $('.debugger');
    var $debugState = $('.stateField');

    var seated = false;                         // Used to handle audio loop to seat user after entering the room
    var tv_activated = false;

    var stateLog = new Array();
    var currentState = Constants.STATE_INIT;

    var socket = io();
    var connected = false;
    var userSeated = false;
    
    // load video
    var player = new Clappr.Player({source: "./video/HKFA 29th Pt3.mp4", parentId: "#player",width:"100%", height:"100%"});

    // Audio parameters
    var defaultAudio = 0.3;
    var currentVolume = defaultAudio;
    var audio_state = ""
    var context = new AudioContext();
    context.resume();
    var playlist = [Constants.TRACK_PLEASE_SIT_ROOM_1, Constants.TRACK_ACTIVATE_TV_ROOM_1, Constants.TRACK_PLEASE_EXIT_ROOM_1]
    var sound = new Howl({ src: [playlist], volume: currentVolume });

    // startup activities
    if(Constants.MODE_DEBUG){ $debug.show() }else{ $debug.hide() }

    function getLastState(){ return stateLog[stateLog.length-1]; }

    function logStateChange(state){
        
        if(Constants.MODE_DEBUG){$debugState.html("State: "+state)}
        stateLog.push(state)
        // maintain a history of 5 only
        while (stateLog.length > 5) {
            stateLog.shift();
        }
        if(Constants.MODE_DEBUG){console.log("State changed to "+state)}
    }

    function setState(state) {
        // handle the different experience states 
        currentState = state

        switch (currentState) {
            case Constants.STATE_INIT:
                // Check that all is setup and ready to go: 
                // If ready - move to next step ->
                context.resume()
                setTimeout(function(){ setState(Constants.STATE_ROOM_READY) }, 3000);
                socket.emit('state', Constants.STATE_INIT);
            break;
            case Constants.STATE_ROOM_READY:
                // init Door sensor and start listening for entrants.
                setTimeout(function(){ setState(Constants.STATE_ROOM_ENTERED) }, 3000); // temp
            break;
            case Constants.STATE_ROOM_ENTERED:
                // Audio to prompt user to sit down.
                playAudio(Constants.TRACK_PLEASE_SIT_ROOM_1, currentVolume);
                audio_state = Constants.AUDIO_PLEASE_SIT_ROOM_1;
                // start listening for seating sensor to trigger

                // once audio is played -> if no trigger is tripped, start the audio prompting loop with increased audio for each iteration.

                // setTimeout(function(){ setState(Constants.STATE_ROOM_ENTERED_UNSEATED) }, 3000); // temp
            break;
            case Constants.STATE_ROOM_ENTERED_UNSEATED:
                // manage prompting cycle and audio volume increase

            break;
            case Constants.STATE_ROOM_USER_SEATED:
                // snap photo and process for overlay
            break;
            case Constants.STATE_ROOM_USER_SEATED_PHOTO_DONE:

            break;
            case Constants.STATE_ROOM_TV_ACTIVATED:
                // Start video - stop all sensor processing until video is done.
            break;
            case Constants.STATE_ROOM_VIDEO_PLAYING:

            break;
            case Constants.STATE_ROOM_VIDEO_FINISHED:

            break;
            case Constants.STATE_ROOM_EXIT_SEQUENCE:
                // Play audio sequence - set timer for post exit reset.

            break;
        }
        // append to history
        logStateChange(state)
    }



    // FUDGE THE START
    // setState(Constants.STATE_INIT);

    // --------- Audio Handling ------------------------

    function playAudio(track, volume){
        
            Howler.volume(volume);  

            sound = new Howl({
                src: [track],
                volume: volume,
            });
            
            sound.once('load', function(){
                    console.log('Playback resumed successfully');
                    sound.volume = volume;
                    sound.play();
            });
            
            sound.on('end', function(){
                sound.unload()
                console.log('Finished!');
                // handle next depending on state
                if(audio_state==Constants.AUDIO_PLEASE_SIT_ROOM_1 && currentState==Constants.STATE_ROOM_ENTERED){
                    setState(Constants.STATE_ROOM_ENTERED_UNSEATED);
                }
    
                console.log("currentState "+currentState)
                if(currentState==Constants.STATE_ROOM_ENTERED_UNSEATED && currentVolume<1){
                    currentVolume = currentVolume+0.1
                    setTimeout(function(){ playAudio(Constants.TRACK_PLEASE_SIT_ROOM_1, currentVolume) }, 1000 );
                }
            });

        
    }


    // ----- Socket handling ---------------------------

    socket.on('sensor event', (data) => {
        switch(data.event){
            case Constants.SENSOR_DOOR_TRIGGERED:
                setState(Constants.STATE_ROOM_ENTERED);
            break;
            case Constants.SENSOR_SEATING_TRIGGERED:
                setState(Constants.STATE_ROOM_USER_SEATED);
            break;
        }
        console.log("SOCKET _ SENSOR EVENT: "+data.event)
    });

    socket.on('state changed', (data) => {
        setState(data);
    });

    socket.on('init', (data) => {
        console.log("init")
        setState(Constants.STATE_INIT);
    });

    socket.on('disconnect', () => {
        console.log('you have been disconnected');
        connected = false;
      });
    
      socket.on('reconnect', () => {
        console.log('you have been reconnected');
        connected = true;
        // If connected is true
        socket.emit('startup', "init");
        setState(Constants.STATE_INIT);
      });
    
      socket.on('reconnect_error', () => {
        console.log('attempt to reconnect has failed');
        connected = false;
      });

});