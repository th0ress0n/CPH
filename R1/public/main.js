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

        API_BASE_PATH                           : "",
        MODE_DEBUG                              : false,

        AUDIO_PLEASE_SIT_ROOM_1                 : "SIT DOWN ROOM 1",
        AUDIO_PLEASE_EXIT_ROOM_1                : "EXIT ROOM 1",
        AUDIO_ACTIVATE_TV_ROOM_1                : "TV ROOM 1",
        AUDIO_TURN_ON_LIGHT                     : "TURN ON LIGHT",
        AUDIO_TURN_ON_AC                        : "TURN ON AC",
        AUDIO_ACTIVATE_TV_ROOM_2                : "TV ROOM 2",
        AUDIO_PLEASE_SIT_ROOM_2                 : "SIT DOWN ROOM 2",
        AUDIO_PLEASE_EXIT_ROOM_2                : "EXIT ROOM 2",
    }
    
    // Initialize variables
    var $window = $(window);

    var $debug = $('.debug');

    var stateLog = new Array();
    var currentState = Constants.STATE_INIT;

    var socket = io();
    var connected = false;

    var player = new Clappr.Player({source: "http://your.video/here.mp4", parentId: "#player"});

    // startup activities
    if(Constants.MODE_DEBUG){ $debug.hide() }else{ $debug.show() }

    function getLastState(){ return stateLog[stateLog.length-1]; }

    function logStateChange(state){
        stateLog.push(state)
        // maintain a history of 5 only
        while (stateLog.length > 5) {
            stateLog.shift();
        }
    }

    function setState(data) {
        // handle the different experience states 
        currentState = data.state

        switch (currentState) {
            case Constants.STATE_INIT:

            break;
            case Constants.STATE_ROOM_READY:

            break;
            case Constants.STATE_ROOM_ENTERED:

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
        logStateChange(data.state)
    }


    // ----- Socket handling ---------------------------

    socket.on('state changed', (data) => {
        setState(data);
      });

    socket.on('disconnect', () => {
        log('you have been disconnected');
      });
    
      socket.on('reconnect', () => {
        log('you have been reconnected');
        if (username) {
          socket.emit('add user', username);
        }
      });
    
      socket.on('reconnect_error', () => {
        log('attempt to reconnect has failed');
      });

});