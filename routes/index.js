
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
  res.render('room', { title: 'Gambit' });
};

/*
 * Post new room.
 */

exports.newRoom = function(req, res) {
  var room_id = 'test';
  res.redirect('/room/' + room_id);
};
