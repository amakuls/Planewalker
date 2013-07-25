
express = require('express')

app = express()

app.use(express.bodyParser())
app.configure( ->
  app.use(
    "/",
    express.static(__dirname)
  )
)

playerstats = {}

playerstats.x = 100
playerstats.y = 100
player.s = 1

app.post('/playerstats', (req, res) ->
  playerstats = req.body
)

app.get('/playerstats', (req, res) ->
  res.send(playerstats)
)


app.listen(3000)