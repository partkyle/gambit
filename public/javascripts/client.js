var socket = io.connect('http://localhost:3000');

var clickHanlder = function() {
  socket.emit('click', {card: parseInt($(this).text())});
};

$('.card').on('click', clickHanlder);
