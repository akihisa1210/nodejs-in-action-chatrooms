const assert = require('power-assert');

const io = require('socket.io-client');

describe('listen', function() {
  let socket = {};
  let anotherSocket = {};
  let guestName;

  beforeEach(function(done) {
    // Setup
    socket = io.connect('http://localhost:3000', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
    });
    socket.on('connect', function() {
      console.log('socket: worked...');
      done();
    });
    socket.on('disconnect', function() {
      console.log('socket: disconnected...');
    });
  });

  it('name user as guest', function(done) {
    socket.on('nameResult', function(data) {
      console.log(data);
      assert(data.success === true);
      assert(data.name.indexOf('Guest') !== -1);
      done();
    });
  });

  it('make client join Lobby first', function(done) {
    socket.on('joinResult', function(data) {
      console.log(data);
      assert(data.room === 'Lobby');
      done();
    });
  });

  it('send message when user joins a room', function(done) {
    anotherSocket = io.connect('http://localhost:3000', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
    });
    anotherSocket.on('connect', function() {
      console.log('Another socket: worked...');
      anotherSocket.on('disconnect', function() {
        console.log('Another socket: disconnected...');
      });
    });
    anotherSocket.on('nameResult', function(data) {
      console.log(data);
      guestName = data.name;
    });

    socket.on('message', function(data) {
      console.log(data);
      assert(data === `${guestName} has joined Lobby.`);
      done();
    });
  });

  it('broadcast message', function(done) {
    anotherSocket = io.connect('http://localhost:3000', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
    });
    anotherSocket.on('connect', function() {
      console.log('Another socket: worked...');
      anotherSocket.on('nameResult', function(data) {
        guestName = data.name;
      });
    });
    anotherSocket.on('disconnect', function() {
      console.log('Another socket: disconnected...');
    });

    anotherSocket.emit('message', {
      room: 'Lobby',
      text: 'hoge!',
    });
    socket.on('message', function(data) {
      assert(data.text === `${guestName}: hoge!`);
      done();
    });
  });

  afterEach(function(done) {
    // Cleanup
    if (socket.connected) {
      console.log('socket: disconnecting...');
      socket.disconnect();
    } else {
      console.log('socket: no connection to break...');
    }
    if ('connected' in anotherSocket) {
      if (anotherSocket.connected) {
        console.log('socket: disconnecting...');
        anotherSocket.disconnect();
      } else {
        console.log('anotherSocket: no connection to break...');
      }
    };
    done();
  });
});
