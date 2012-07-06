$(function() {
  if ($('.cards').length) {
    var socket = io.connect('http://localhost:3000');

    var $nameField = $('input[name="name"]');
    var $players = $('#players');
    var room;
    var players;
    var path = window.location.pathname.split('/');

    var player_name = prompt('Name?');

    socket.emit('init', { room_id: path[path.length - 1], name: player_name });

    socket.on('update-name', function(data) {
      room = data.room;
      $nameField.val(room.name);
    });

    socket.on('update-players', function(data) {
      players = data.players;
      var html = '<ul>';
      for (var player in players) {
        html += '<li>' + players[player].name + '</li>';
      }
      html += '</ul>';
      $players.html(html);
    });

    var clickHanlder = function() {
      socket.emit('click', {card: parseInt($(this).text(), 10)});
    };

    var nameHandler = function() {
      room.name = $(this).val();
      socket.emit('change-name', { room: room });
    };

    $('.card').on('click', clickHanlder);
    $nameField.on('change', nameHandler);
  }
});
