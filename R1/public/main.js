$(function() {

    var Constants = require("./constants")
    // Initialize variables
    var $window = $(window);

    var $debug = $('.debug');

    var stateLog = new Array();
    var currentState = "INIT"

    var socket = io();
    var connected = false;


    function logStateChange(state){
        stateLog.push(state)
        // maintain a history of 5 only
        while (stateLog.length > 5) {
            stateLog.shift();
        }
    }

    function setState(data) {
        // handle the different experience states 
        
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