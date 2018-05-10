$(function () {
  var socket = io();
  var typing = false;
  $('form').submit(function () {
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
      return false;
    });
    socket.on('chat message', function (msg, name) {
      $('#messages').append($('<li>').text(name + ': ' + msg))
    });

    socket.on('user-connected', function (len, name) {
      $('#username').text(name);
      $('#messages').append($('<li>').text(name + ' joined: ' + len + ' users connected'));
    });

    socket.on('user-disconnected', function (len, name) {
      $('#messages').append($('<li>').text(name + ' disconnected: ' + len + ' users connected'));
    });
    socket.on('user-typing', function (name) {
      $('#typing').slideDown(500).text(name + ' is typing...');
    });
    socket.on('user-stopped-typing', function (name) {
      $('#typing').slideUp(500);
    });

    // Check if user is typing
    var timer;
    $('#m').keypress(function (e) {
      if (e.which !== 13) {
        clearTimeout(timer);
        socket.emit('typing', true);
        timer = setTimeout(function() {
          socket.emit('typing', false)
        }, 1000);
      }
    });
});
