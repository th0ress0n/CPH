$(function() {

    var Constants = require("./constants")
    // Initialize variables
    var $window = $(window);

    var $debug = $('.debug');

    var stateLog = new Array();
    var currentState = Constants.STATE_INIT;

    var socket = io();
    var connected = false;



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