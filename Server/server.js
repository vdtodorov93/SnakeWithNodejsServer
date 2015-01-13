var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = 3000;
var path = require('path');
var pathToClient = path.normalize(__dirname + '/../Client/');

var gameLogic = require('./gameLogic');

app.use(express.static(pathToClient));

app.get('/', function(req, res) {
    //console.log(__dirname + '/../Client/index.html');
    var pathToIndex = path.normalize(pathToClient + 'index.html');
    res.sendFile(pathToIndex);
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    socket.on('start game', function(msg) {
        console.log('Player joined: ' + msg);
        var game = new gameLogic.Game(socket);
        game.startGame();
    });
});

http.listen(port, function(){
    console.log('listenint on port: ' + port);
});