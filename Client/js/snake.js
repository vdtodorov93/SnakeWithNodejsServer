var FieldEnum = {
    FREE: 0,
    WALL: 1,
    FRUIT: 2,
    SNAKE: 3
};

var ClassEnum = {
    FREE: 'free-field',
    WALL: 'obstacle',
    FRUIT: 'fruit',
    SNAKE: 'snake'
};

var KeyCode = {
    LEFT: 37,
    TOP: 38,
    RIGHT: 39,
    DOWN: 40
};

function visualizeMap(matrix) {
    var $container = $('#container'),
        lenX = matrix.length,
        lenY = matrix[0].length,
        i,
        j;

    $container.html('');
    for(i = 0; i < lenX; i+=1) {
        var $lineDiv = $('<div>');
        for(j = 0; j < lenY; j+=1) {
            var $span = $('<span>');
            switch(matrix[i][j])
            {
                case FieldEnum.FREE:
                    $span.addClass(ClassEnum.FREE);
                    break;
                case FieldEnum.WALL:
                    $span.addClass(ClassEnum.WALL);
                    break;
                case FieldEnum.FRUIT:
                    $span.addClass(ClassEnum.FRUIT);
                    break;
                case FieldEnum.SNAKE:
                    $span.addClass(ClassEnum.SNAKE);
                    break;
            }
            $lineDiv.append($span);
        }
        $container.append($lineDiv);
    }
}

var socket = io();
$('#play').on('click', function() {
    socket.emit('start game', $('#name').val());
    $('#game-progress').html('');
    return false;
});

socket.on('visualize', function(data) {
    var matrix = JSON.parse(data);
    visualizeMap(matrix);
});

socket.on('updateScore', function(data) {
    var score = JSON.parse(data);
    $('#total-score').html(score);
});

socket.on('gameOver', function(data) {
    var score = JSON.parse(data);
    var message = '<h3>' + 'GAME OVER! TOTAL SCORE: ' + score + '</h3>';
    $('#game-progress').html(message);
});

document.onkeydown = changeDirectionEvent;
function changeDirectionEvent (e) {
    switch(e.keyCode){
        case KeyCode.LEFT:
            socket.emit('changeDirection', 'left');
            break;
        case KeyCode.RIGHT:
            socket.emit('changeDirection', 'right');
            break;
        case KeyCode.TOP:
            socket.emit('changeDirection', 'top');
            break;
        case KeyCode.DOWN:
            socket.emit('changeDirection', 'down');
            break;
    }
}





//visualizeMap(matrix);