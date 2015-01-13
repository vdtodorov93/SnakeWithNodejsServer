var FieldEnum = {
    FREE: 0,
    WALL: 1,
    FRUIT: 2,
    SNAKE: 3
};

var Direction = {
    LEFT: 0,
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 3
};

var KeyCode = {
    LEFT: 37,
    TOP: 38,
    RIGHT: 39,
    DOWN: 40
};

var miliseconds = 800;

function getGameField() {
    return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
}

function Position(x, y) {
    this.x = x;
    this.y = y;
}

function Snake(positions) {
    this.body = positions;
    this.direction = Direction.TOP;
    this.temporateDirection = this.direction;
}

function Game(socket) {
    this.score = -1;
    this.socket = socket;
    this.matrix = getGameField();
    this.snake = new Snake([new Position(5, 5), new Position(5, 6)]);
    var that = this;
    this.socket.on('changeDirection', function(direction) {
        switch(direction) {
            case 'left':
                if(that.snake.direction !== Direction.RIGHT) {
                    that.snake.temporateDirection = Direction.LEFT;
                }
                break;
            case 'right':
                if(that.snake.direction !== Direction.LEFT) {
                    that.snake.temporateDirection = Direction.RIGHT;
                }
                break;
            case 'top':
                if(that.snake.direction !== Direction.BOTTOM) {
                    that.snake.temporateDirection = Direction.TOP;
                }
                break;
            case 'down':
                if(that.snake.direction !== Direction.TOP) {
                    that.snake.temporateDirection = Direction.BOTTOM;
                }
                break;
        }
    });
    this.socket.on('startGame', this.startGame);
}

Game.prototype.changeDirection = function(direction) {
    switch(direction) {
        case 'left':
            if(this.snake.direction !== Direction.RIGHT) {
                this.snake.temporateDirection = Direction.LEFT;
            }
            break;
        case 'right':
            if(this.snake.direction !== Direction.LEFT) {
                this.snake.temporateDirection = Direction.RIGHT;
            }
            break;
        case 'top':
            if(this.snake.direction !== Direction.BOTTOM) {
                this.snake.temporateDirection = Direction.TOP;
            }
            break;
        case 'down':
            if(this.snake.direction !== Direction.TOP) {
                this.snake.temporateDirection = Direction.BOTTOM;
            }
            break;
    }
};

Game.prototype.resetGameField = function() {
    var matrix = this.matrix;
    this.score = -1;

    for(var i = 0; i < matrix.length; i+=1) {
        for(var j = 0; j < matrix[0].length; j+=1) {
            if(matrix[i][j] === FieldEnum.SNAKE) {
                matrix[i][j] = FieldEnum.FREE;
            }
        }
    }
};

Game.prototype.updateScore = function(update) {
    update = update || 1;
    this.score += update;
    this.socket.emit('updateScore', JSON.stringify(this.score));
};

Game.prototype.startGame = function() {
    this.resetGameField();
    this.applySnake();
    this.updateScore(0);
    this.visualizeGameField();
    var that = this;
    this.gameInterval = setInterval(
        function() {
            Game.prototype.playTurn.apply(that);
        }, miliseconds);
};

Game.prototype.gameOver = function () {
    this.socket.emit('gameOver', this.score);
};

Game.prototype.generateNewFruit = function() {
    var x = -1,
        y = -1;
    do {
        x = Math.floor(Math.random() * this.matrix.length);
        y = Math.floor(Math.random() * this.matrix[0].length);
    } while(this.matrix[x][y] !== FieldEnum.FREE);
    this.matrix[x][y] = FieldEnum.FRUIT;
};

Game.prototype.applySnake = function() {
    for(var i = 0; i < this.snake.body.length; i+=1) {
        var x = this.snake.body[i].x,
            y = this.snake.body[i].y;
        this.matrix[x][y] = FieldEnum.SNAKE;
    }
};

Game.prototype.visualizeGameField = function() {
    this.socket.emit('visualize', JSON.stringify(this.matrix));
};

Game.prototype.playTurn = function() {
    var x = this.snake.body[0].x,
        y = this.snake.body[0].y,
        lost = false;

    this.snake.direction = this.snake.temporateDirection;
    switch(this.snake.direction) {
        case Direction.LEFT:
            y--;
            break;
        case Direction.TOP:
            x--;
            break;
        case Direction.RIGHT:
            y++;
            break;
        case Direction.BOTTOM:
            x++;
            break;
    }

    this.snake.body.unshift(new Position(x, y));
    if(this.matrix[x][y] === FieldEnum.FRUIT) {
        this.updateScore();
        this.generateNewFruit();
    } else if(this.matrix[x][y] === FieldEnum.WALL || this.matrix[x][y] === FieldEnum.SNAKE) {
        this.gameOver();
        lost = true;
    } else {
        var pos = this.snake.body.pop();
        this.matrix[pos.x][pos.y] = FieldEnum.FREE;
    }
    if(lost) {
        clearInterval(this.gameInterval);
    } else {
        this.applySnake(this.snake, this.matrix);
        this.visualizeGameField();
    }
};

module.exports = {
    Game : Game
};
