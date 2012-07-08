
/**
 * Module dependencies.
 */

require('./lib/object');

var express = require('express');
var routes = require('./routes');
var Room = require('./lib/room');
var uuid = require('node-uuid');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

var ROOM_TIME_LIMIT = 1000 * 60 * 5; // 5 minutes

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/room/:id', routes.room);
app.post('/room', routes.newRoom);

var clearIfEmpty = function(room) {
  // the next user will trigger the timeout,
  // so we can ignore this.
  if (room.players.size() === 0) {
    Room.delete(room.id);
  }
};


// Sockets

io.sockets.on('connection', function(socket) {
  var room;
  var player;
  var player_id = uuid.v4();

  var updatePlayers = function() {
    io.sockets.in(room.id).emit('update-players', { players: room.players });
  };

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
  });

  socket.on('disconnect', function(data) {
    delete room.players[player_id];
    updatePlayers();

    setTimeout(function() {
      clearIfEmpty(room);
    }, ROOM_TIME_LIMIT);
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
