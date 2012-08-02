$(function() {
  var socket = io.connect(window.location.hostname);

  if($("#lobby").length) {
    socket.emit('lobby');

    var updateRoomList = function(data) {
      var source   = $("#update-room-list").html();
      var template = Handlebars.compile(source);
      var rooms = [];

      for (var room_id in data.rooms) {
        rooms.push(data.rooms[room_id]);
      }

      $('#lobby').html(template({rooms: rooms}));
    };

    socket.on('update-rooms', updateRoomList);
  }

  if ($('.cards').length) {
    var $nameField = $('input[name="name"]');
    var $playerNameField = $('input[name="player"]');
    var $players = $('#players');
    var room;
    var path = window.location.pathname.split('/');

    var badgeFor = function(score) {
      var badge = 'badge';

      switch(score) {
        case 2:
          badge += ' badge-inverse';
          break;
        case 3:
          badge += ' badge-success';
          break;
        case 5:
          badge += ' badge-info';
          break;
        case 8:
          badge += ' badge-warning';
          break;
        case 13:
          badge += ' badge-important';
          break;
      }

      return badge;
    };

    var updatePlayersHandler = function(data) {
      console.log(data);
      var players = [];
      var myBadge = function() {
        return badgeFor(this.score);
      };
      for (var player_id in data.players) {
        var player = data.players[player_id];
        player.score_badge = myBadge;
        players.push(player);
      }
      var source   = $("#player-list").html();
      var template = Handlebars.compile(source);

      $players.html(template({players: players}));

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
