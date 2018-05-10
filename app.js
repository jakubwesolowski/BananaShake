var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

class User {
  constructor(name) {
    this.name = name;
  }
}
User.id = 0;


connections = [];
users = [];

io.on('connection', function (socket) {
  var user = new User('Guest' + User.id++);

  connections.push(socket);
  io.emit('user-connected', connections.length, user.name);

  socket.on('disconnect', function () {
    connections.pop(socket);
    io.emit('user-disconnected', connections.length, user.name);
  });

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg, user.name);
  });

  socket.on('typing', function (typing) {
    if(typing) {
      io.emit('user-typing', user.name);
    }
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});


