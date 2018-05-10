const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const usersRegistered = [
    {id: '2f24vvg', email: 'kubawesolowski@me.com', password: 'pass'}
];

// Setting passport to use local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email'},
    (email, password, done) => {
        const user = usersRegistered[0];
        if (email === user.email && password === user.password) {
            return done(null, user);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = usersRegistered[0].id === id ? usersRegistered[0] : false;
    done(null, user);
});

app.use(bodyParser.urlencoded({ extend: false }));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
      return uuid();
    },
    store: new FileStore(),
    secret: 'bananashakesecretkey',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/public", express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send('You are on auth page!');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        req.login(user, (err) => {
            res.redirect('/');
        });
    })(req, res, next);
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
    }else{
      io.emit('user-stopped-typing')
    }
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});


