gameCanvas = document.getElementById("game")
grafx = gameCanvas.getContext('2d')
class Player
  constructor:  ->
    @width = 0
    @height = 0
    @Previous_X = 0
    @Previous_Y = 0
    @Velocity_X = 0
    @Velocity_Y = 0
    @speed = 2.5
    @diagonalSpeed = (Math.sqrt(@speed*@speed*2))/2

spriteFrames = {}
player = new Player()
spritesheet = new Image()
currentFrame = "0001"

$.get("/PCSprite.json", (data) ->
  spritesheetinfo = data
  spritesheet.src = "Images/PCSprite.png"
  spritesheet.width = spritesheetinfo.meta.w
  spritesheet.height = spritesheetinfo.meta.h
  spriteFrames = spritesheetinfo.frames
  player.sprite = spriteFrames["PCLeft-Idle#{currentFrame}.png"]
  player.height = player.sprite.frame.h
  player.width =  player.sprite.frame.w
  $.get("/playerstats", (data) ->
    player.side = parseFloat(data.s)
    player.Y = parseFloat(data.y)
    player.X = parseFloat(data.x)
    MainLoop()
  )
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

currentFrameNum = 0
currentFrameNum2 =0

currentFrameIncrease = ->
  currentFrameNum = parseFloat(currentFrame[3])
  currentFrameNum2 = parseFloat(currentFrame[2])
  if currentFrameNum is 2
    currentFrameNum2 = 0
  if currentFrameNum < 9
    currentFrameNum++
  else
    currentFrameNum2 = 1
    currentFrameNum = 1
  currentFrame = "00" + String(currentFrameNum2) + String(currentFrameNum)

setInterval(currentFrameIncrease,1000/12)
MainLoop = ->
  gameCanvas.width =  window.innerWidth
  gameCanvas.height =  window.innerHeight
  if isUp
    player.Velocity_Y = -(player.speed)
  if isDown
    player.Velocity_Y = player.speed
  if isLeft
    player.Velocity_X = -(player.speed)
    player.side = 3
  if isRight
    player.Velocity_X = player.speed
    player.side = 4
  player.Velocity_X = 0 if not isLeft and not isRight
  player.Velocity_Y = 0 if not isUp and not isDown
  player.Velocity_Y = -player.diagonalSpeed if isUp and (isRight or isLeft)
  player.Velocity_Y = player.diagonalSpeed if isDown and (isRight or isLeft)
  player.Velocity_X = -player.diagonalSpeed if isLeft and (isUp or isDown)
  player.Velocity_X = player.diagonalSpeed if isRight and (isUp or isDown)
  if player.side is 3
    player.sprite = spriteFrames["PCLeft-Idle#{currentFrame}.png"]
  if player.side is 4
    player.sprite = spriteFrames["PCright#{currentFrame}.png"]
  player.X += player.Velocity_X;
  player.Y += player.Velocity_Y;

  grafx.clearRect(0,0,gameCanvas.width,gameCanvas.height)
  grafx.drawImage(spritesheet,player.sprite.frame.x,player.sprite.frame.y,player.width,player.height,player.X,player.Y,player.width,player.height)
  requestAnimationFrame(MainLoop)

