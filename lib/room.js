
/*
 * Simple room management object
 */

var rooms = {};

module.exports = {
  'find': function(id) {
    return rooms[id];
  },
  'all': function(id) {
    return rooms;
  },
  'create': function(id, room) {
    rooms[id] = room;
  },
  'delete': function(id) {
    delete rooms[id];
  }
};
