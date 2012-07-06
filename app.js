
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var Room = require('./lib/room');
var uuid = require('node-uuid');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express['static'](__dirname + '/public'));
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


// Sockets

io.sockets.on('connection', function(socket) {
  var room;
  var player;
  var player_id = uuid.v4();

  socket.on('init', function(data) {
    room = Room.find(data.room_id);
    room.players[player_id] = { name: player_id };
    socket.set('room', room.id);
    socket.join(room.id);

    io.sockets['in'](room.id).emit('update-players', { players: room.players });

    socket.emit('update-name', { room: room });
  });

  socket.on('click', function(data) {
    console.log(data);
  });

  socket.on('change-name', function(data) {
    room.players[player_id].name = data.name;
    io.sockets['in'](room.id).emit('update-players', { players: room.players });
  });

  socket.on('change-room-name', function(data) {
    console.log('changing room name for ' + data.room.id);
    room.name = data.room.name;
    io.sockets['in'](room.id).emit('update-name', { room: room });
  });

  socket.on('disconnect', function(data) {
    delete room.players[player_id];
    io.sockets['in'](room.id).emit('update-players', { players: room.players });
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
