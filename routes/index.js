var Room = require('../lib/room');
var uuid = require('node-uuid');

/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'Gambit' });
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
  Room.create(room_id, {
    id: room_id,
    name: room_id,
    players: {},
    done: function() {
      var count = 0;
      for (var player in this.players) {
        if (this.players[player].score) {
          count += 1;
        }
      }
      console.log('Found %s/%s players finished.', count, this.players.size());
      return count >= this.players.size();
    },
    reset: function() {
      for (var player in this.players) {
        this.players[player].score = null;
      }
    }
  });
  res.redirect('/room/' + room_id);
};
