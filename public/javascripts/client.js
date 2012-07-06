$(function() {
  if ($('.cards').length) {
    var socket = io.connect('http://localhost:3000');

    var $nameField = $('input[name="name"]');
    var $playerNameField = $('input[name="player"]');
    var $players = $('#players');
    var room;
    var players;
    var path = window.location.pathname.split('/');

    socket.emit('init', { room_id: path[path.length - 1] });

    socket.on('update-name', function(data) {
      room = data.room;
      $nameField.val(room.name);
    });

    socket.on('update-players', function(data) {
      players = data.players;
      var html = '<ul class="unstyled">';
      for (var player in players) {
        html += '<li class="clearfix shelf" data-player-id="' + player + '">';
        html += '<span class="pull-left">' + players[player].name + '</span>';
        if (players[player].score) {
          html += '<span class="pull-right end-round">' + players[player].score + '</span>';
        }
        html += '</li>';
      }
      html += '</ul>';
      $players.html(html);
    });

    var clickHanlder = function() {
      var self = $(this);
      if (self.is('.selected')) {
        socket.emit('click-card', { score: null });
        self.removeClass('selected');
      } else {
        $('.selected').removeClass('selected');
        self.addClass('selected');
        socket.emit('click-card', { score: parseInt($(this).text(), 10) });
      }
    };

    var nameHandler = function() {
      room.name = $(this).val();
      socket.emit('change-room-name', { room: room });
    };

    var playerNameHandler = function() {
      var player = $playerNameField.val();
      socket.emit('change-name', { name: player });
    };

    $('.card').on('click', clickHanlder);
    $nameField.on('change', nameHandler);
    $playerNameField.on('change', playerNameHandler);
  }
});
