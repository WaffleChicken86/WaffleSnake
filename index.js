const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))


function handleIndex(request, response) {
  var battlesnakeInfo = {
    apiversion: '1',
    author: 'Waffle',
    color: '#3E338F',
    head: 'comet',
    tail: 'mlh-gene'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  var gameData = request.body

  console.log('START')
  response.status(200).send('ok')
}

// Functions for battlesnake strategy
// Checks if move would hit the wall
function hitsWall(newHeadPos, boardWidth, boardHeight) {
  if (newHeadPos.y >= boardHeight || newHeadPos.y < 0 || newHeadPos.x >= boardWidth || newHeadPos.x < 0) {
    console.log("Hits wall")
    return true
  }
  return false
}

// Checks if move would hit self
function hitsSnake(newHeadPos, bodyCoords) {
  for (var i = 0; i < bodyCoords.length; ++i) {
    var bodyCoord = bodyCoords[i]
    if (newHeadPos.x === bodyCoord.x && newHeadPos.y === bodyCoord.y) {
      console.log("Hits snake")
      return true
    }
  }
  return false
}

// Checks if move would hit other snakes
function hitsOtherSnakes(newHeadPos, snakes) {
  for (var i = 0; i < snakes.length; ++i) {
    var snake = snakes[i]
    if (hitsSnake(newHeadPos, snake.body)) {
      return true
    }
  }
  return false
}


function findClosestFood(headCoord, food) {
  var closest = {
    distance: Number.MAX_VALUE,
    coords: {
      x: 0,
      y: 0
    }
  };
  var i, d;
  for (i = 0; i < food.length; i++) {
    d = distance(headCoord.x, headCoord.y, food[i][0], food[i][1]);
    if (d <= closest.distance) {
      closest.distance = d;
      closest.coords = {
        x: food[i][0],
        y: food[i][1]
      };
    }
  }

  return {
    x: closest.coords.x,
    y: closest.coords.y
  };
}
// Returns object with new head position after move
function getNewPos(headCoord, move) {
  var newPos = {...headCoord}
  switch (move) {
    case 'up':
      newPos.y = headCoord.y + 1
      break
    case 'down':
      newPos.y = headCoord.y - 1
      break
    case 'left':
      newPos.x = headCoord.x - 1
      break
    case 'right':
      newPos.x = headCoord.x + 1
      break
  }
  return newPos
}

function handleMove(request, response) {
  var gameData = request.body

  var yourSnake = gameData.you
  var board = gameData.board

  var possibleMoves = ['up', 'down', 'left', 'right']
  var move
  var done=false
  while (!done) {
    /*var food=findClosestFood(headCoord,gameData.food)
    var move
    if(food.x>headCoord.x){
      move='left'
    }else if(food.x<headCoord.x){
      move='right'
    }else if(food.y>headCoord.y){
      move='up'
    }else if(food.y<headCoord.y){
      move='down'
    }else{
      console.log('No food detected');*/
      move = possibleMoves[Math.round(Math.random()*possibleMoves.length)]
    //}
    var newHeadPos = getNewPos(yourSnake.head, move)
    headHitsWall = hitsWall(newHeadPos, board.width, board.height)
    var headHitsSelf = hitsSnake(newHeadPos, yourSnake.body)
    var headHitsSnake = hitsOtherSnakes(newHeadPos, board.snakes)
    if (!headHitsWall && !headHitsSelf && !headHitsSnake) {
      done=true
      break
    }
  }

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  var gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
