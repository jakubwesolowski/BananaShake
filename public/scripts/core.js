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
        typing = true;

    });

    socket.on('user-typing', function (name) {
        $('#typing').slideDown(500).text(name + ' is typing...');
        typingTimeout = setTimeout(function () {
            $('#typing').slideUp(500);
        }, 2000);
    });

    // Check if user is typing
    $('#m').keypress(function (e) {
      if (e.which !== 13) {
        socket.emit('typing', true);
        typing = true;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            socket.emit('typing', false);
        }, 2000);
      }
    });
  });
