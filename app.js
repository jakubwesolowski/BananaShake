const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const uuid = require('uuid/v4');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const passportSocketIo = require('passport.socketio');

const usersRegistered = [
    {id: '2f24vvg', email: 'kubawesolowski@me.com', password: 'pass', nickname: 'Kuba'},
    {id: '809g43j', email: 'patryk@zolkiewski.pl', password: 'carbon', nickname: 'Patryk'}
];

// Setting passport to use local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email'},
    (email, password, done) => {
        for(var i = 0; i < usersRegistered.length; i++) {
            const user = usersRegistered[i];
            if (email === user.email && password === user.password) {
              return done(null, user);
            }else{
              
            }
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    var user = false;
    for(var i = 0; i < usersRegistered.length; i++) {
        if (usersRegistered[i].id === id) {
            user = usersRegistered[i];
        }
    }
    done(null, user);
});

app.use(bodyParser.urlencoded({ extend: false }));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
      return uuid();
    },
    store: new FileStore({logFn: function(){}}),
    secret: 'bananashakesecretkey',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/public", express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/index.html');
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

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// TODO: Implement register form, save it to table first
app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/views/register.html');
});


app.post('/register', function (req, res) {
    // req.register
});

connections = [];
users = [];
io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: 'bananashakesecretkey',
  store: new FileStore(),
  passport: passport,
  cookieParser: cookieParser
}));

io.on('connection', function (socket) {

  connections.push(socket);
  io.emit('user-connected', connections.length, socket.request.user.nickname);
  console.log(socket.request.user);

  socket.on('disconnect', function () {
    connections.pop(socket);
    io.emit('user-disconnected', connections.length, socket.request.user.nickname);
  });

  socket.on('chat message', function (msg) {
    console.log(socket.request.session);
    io.emit('chat message', msg, socket.request.user.nickname);
  });

  socket.on('typing', function (typing) {
    if(typing) {
      io.emit('user-typing', socket.request.user.nickname);
    }else{
      io.emit('user-stopped-typing')
    }
  })
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});


