
/**
 * Module dependencies.
 */

require('./lib/object');

var express = require('express');
var routes = require('./routes');
var Room = require('./lib/room');
var uuid = require('node-uuid');
var http = require('http');
var path = require('path');

var app = express();

// Configuration
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

// Routes

app.get('/', routes.index);

app.get('/room/:id', function(req, res, next) {
  io.sockets.in('lobby').emit('update-rooms', { rooms: Room.all() });
  next();
}, routes.room);
app.post('/room', routes.newRoom);

// var clearIfEmpty = function(room) {
//   // the next user will trigger the timeout,
//   // so we can ignore this.
//   if (room.players.size() === 0) {
//     Room.delete(room.id);
//   }
// };


// Sockets

var io = require('socket.io').listen(server);

var ROOM_TIME_LIMIT = 1000 * 60 * 5; // 5 minutes

io.sockets.on('connection', function(socket) {
  var room;
  var player;
  var player_id = uuid.v4();

  var updatePlayers = function() {
    io.sockets.in(room.id).emit('update-players', { players: room.players, showResult: room.done() });
  };

  socket.on('lobby', function(data) {
    console.log('user connected to lobby');
    socket.set('room', 'lobby');
    socket.join('lobby');

    socket.emit('update-rooms', { rooms: Room.all() });
  });

  socket.on('init', function(data) {
    room = Room.find(data.room_id);
    room.players[player_id] = { name: player_id };
    socket.set('room', room.id);
    socket.join(room.id);

    updatePlayers();

    socket.emit('update-name', { room: room });
  });

  socket.on('click-card', function(data) {
    console.log('player [%s] clicked %s', player_id, data.score);
    room.players[player_id].score = data.score;
    updatePlayers();
  });

  socket.on('change-name', function(data) {
    room.players[player_id].name = data.name;
    updatePlayers();
  });

  socket.on('change-room-name', function(data) {
    console.log('changing room name for %s', data.room.id);
    room.name = data.room.name;
    io.sockets.in(room.id).emit('update-name', { room: room });
    io.sockets.in('lobby').emit('update-rooms', { rooms: Room.all() });
  });

  socket.on('reset-game', function(data) {
    room.reset();
    io.sockets.in(room.id).emit('reset-game', { players: room.players });
  });

  socket.on('disconnect', function(data) {
    if (room) {
      delete room.players[player_id];
      updatePlayers();

//       setTimeout(function() {
//         clearIfEmpty(room);
//       }, ROOM_TIME_LIMIT);
    }
  });
});
