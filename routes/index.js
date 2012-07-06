var Room = require('../lib/room');
var uuid = require('node-uuid');

/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Gambit', rooms: Room.all() });
};

/*
 * GET room.
 */

exports.room = function(req, res) {
  var room = Room.find(req.params.id);
  if (!room) {
    res.redirect('/');
  } else {
    res.render('room', { title: 'Gambit', room: room });
  }
};

/*
 * Post new room.
 */

exports.newRoom = function(req, res) {
  var room_id = uuid.v4();
  Room.create(room_id, { id: room_id, name: room_id, players: {} });
  res.redirect('/room/' + room_id);
};
