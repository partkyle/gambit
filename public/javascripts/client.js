$(function() {
  var socket = io.connect(window.location.hostname);

  if($("#lobby").length) {
    socket.emit('lobby');

    var updateRoomList = function(data) {
      var html = '<ul class="unstyled">';
      for (var room in data.rooms) {
        var r = data.rooms[room];
        html += '<li class="shelf">';
        html += '<a href="/room/' + r.id + '">' + r.name + '</a>';
        html += '</li>';
      }
      html += '</ul>';

      $('#lobby').html(html);
    };

    socket.on('update-rooms', updateRoomList);
  }

  if ($('.cards').length) {
    var $nameField = $('input[name="name"]');
    var $playerNameField = $('input[name="player"]');
    var $players = $('#players');
    var room;
    var players;
    var path = window.location.pathname.split('/');

    var updatePlayersHandler = function(data) {
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

      if (data.showResult) {
        $('body').addClass('results');
      } else {
        $('body').removeClass('results');
      }
    };

    socket.emit('init', { room_id: path[path.length - 1] });

    socket.on('update-name', function(data) {
      room = data.room;
      $nameField.val(room.name);
    });

    socket.on('reset-game', function(data) {
      $('body').removeClass('results');
      $('.selected').removeClass('selected');
      updatePlayersHandler(data);
    });

    socket.on('update-players', updatePlayersHandler);

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

    var resetHandler = function(e) {
      e.preventDefault();
      socket.emit('reset-game');
      return false;
    };

    $('.card').on('click', clickHanlder);
    $nameField.on('change', nameHandler);
    $playerNameField.on('change', playerNameHandler);
    $('#reset').on('click', resetHandler);
  }
});
