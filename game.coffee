gameCanvas = document.getElementById("game")
grafx = gameCanvas.getContext('2d')
spritesheet = new Image()
spritesheet.src = "assets/images/spritesheet-1.png"
spritesheet.srcX = 48
spritesheet.srcY = 0
spritesheet.width = 43
spritesheet.height = 58
class Player
  constructor: (img,width,height) ->
    @Sprite = new Image()
    @Sprite.src = img
    @width = width
    @height = height
    @Previous_X = 0
    @Previous_Y = 0
    @Velocity_X = 0
    @Velocity_Y = 0
    @speed = 2.5

player = new Player("assets/images/player.png",60,82)

$.get("/playerstats", (data) ->
  player.side = parseFloat(data.s)
  player.Y = parseFloat(data.y)
  player.X = parseFloat(data.x)
  grafx.drawImage(spritesheet,spritesheet.srcX,spritesheet.srcY,spritesheet.width,spritesheet.height,player.X,player.Y,spritesheet.width,spritesheet.height)
)

isLeft = false
isRight = false
isUp = false
isDown = false

window.onkeydown = (e) ->
  isLeft = true if e.keyCode is 65
  isRight = true if e.keyCode is 68
  isUp = true if e.keyCode is 87
  isDown = true if e.keyCode is 83

window.onkeyup = (e) ->
  isLeft = false if e.keyCode is 65
  isRight = false if e.keyCode is 68
  isUp = false if e.keyCode is 87
  isDown = false if e.keyCode is 83


window.onbeforeunload = ->
  $.post("/playerstats", {x:player.X,y:player.Y,s:player.side})

window.onunload = ->
  $.post("/playerstats", {x:player.X,y:player.Y,s:player.side})

MainLoop = ->
  gameCanvas.width =  window.innerWidth
  gameCanvas.height =  window.innerHeight
  if isUp
    player.Velocity_Y = -(player.speed)
    player.side = 2
  if isDown
    player.Velocity_Y = player.speed
    player.side = 1
  if isLeft
    player.Velocity_X = -(player.speed)
    player.side = 3
  if isRight
    player.Velocity_X = player.speed
    player.side = 4
  player.Velocity_X = 0 if not isLeft and not isRight
  player.Velocity_Y = 0 if not isUp and not isDown
  player.Velocity_Y = -(Math.sqrt(player.speed*player.speed*2))/2 if isUp and (isRight or isLeft)
  player.Velocity_Y = (Math.sqrt(player.speed*player.speed*2))/2 if isDown and (isRight or isLeft)
  player.Velocity_X = -(Math.sqrt(player.speed*player.speed*2))/2 if isLeft and (isUp or isDown)
  player.Velocity_X = (Math.sqrt(player.speed*player.speed*2))/2 if isRight and (isUp or isDown)
  if player.side is 2
    spritesheet.srcX = 0
    spritesheet.srcY = 65
  if player.side is 1
    spritesheet.srcX = 46
    spritesheet.srcY = 0
  if player.side is 3
    spritesheet.srcX = 3
    spritesheet.srcY = 4
  if player.side is 4
    spritesheet.srcX=46
    spritesheet.srcY=65

  player.X += player.Velocity_X;
  player.Y += player.Velocity_Y;

  grafx.clearRect(0,0,gameCanvas.width,gameCanvas.height)
  grafx.drawImage(spritesheet,spritesheet.srcX,spritesheet.srcY,spritesheet.width,spritesheet.height,player.X,player.Y,spritesheet.width,spritesheet.height)
  requestAnimationFrame(MainLoop)

MainLoop()
