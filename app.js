
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var io = require('socket.io');
var Room = require('./lib/room');

var app = module.exports = express.createServer();

io = io.listen(app);

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

var SOCKS = {};

io.sockets.on('connection', function(socket) {

  var room_id;
  var room;
  
  emitOthers = function(id, event, data) {
    var others = SOCKS[id];
    for (var sock in others) {
      var other = others[sock];
      other.emit(event, data);
    }
  };

  socket.on('init', function(data) {
    console.log('initializing socket');
    room = Room.find(data.room_id);

    SOCKS[room.id] = SOCKS[room.id] || [];
    SOCKS[room.id].push(socket);

    room.players.push({name: data.name});

    emitOthers(room.id, 'update-players', { players: room.players });

    socket.emit('update-name', { room: room });
  });

  socket.on('click', function(data) {
    console.log(data);
  });

  socket.on('change-name', function(data) {
    console.log('changing room name for ' + data.room.id);
    room.name = data.room.name;
    emitOthers(room.id, 'update-name', { room: room });
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
