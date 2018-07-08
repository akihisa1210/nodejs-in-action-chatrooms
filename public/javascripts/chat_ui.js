const divEscapedContentElement = (message) => {
  return $('<div></div>').text(message);
};

const divSystemContentElement = (message) => {
  return $('<div></div>').html(`<i>${message}</i>`);
};

const processUserInput = (chatApp, socket) => {
  const message = $('#send-message').val();
  let systemMessage;

  if (message.charAt(0) == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }
  } else {
    chatApp.sendMessage($('#roon').text(), message);
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('send-message').val('');
};

const socket = io.connect();

$(document).ready(() => {
  const chatApp = new Chat(socket);
  socket.on('nameResult', (result) => {
    let message;
    if (result.success) {
      message = `You are now known as ${result.name}.`;
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', (message) => {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', (message) => {
    const newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', (rooms) => {
    $('#room-list').empty();
    for (let room in rooms) {
      if ({}.hasOwnProperty.call(rooms, room)) {
        room = room.substring(1, room.length);
        if (room != '') {
          $('#room-list').append(divEscapedContentElement(room));
        }
      }
    }
    $('$room-list div').click(() => {
      chatApp.processCommand(`/join ${$(this).text()}`);
      $('#send-message').focus();
    });
  });

  setInterval(() => {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(() => {
    processUserInput(chatApp, socket);
    return false;
  });
});
