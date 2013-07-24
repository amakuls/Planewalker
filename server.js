var express = require('express');
var app = express();
app.configure(function () {
    app.use(
        "/",
        express.static(__dirname)
    );
});

var playerstats = {};

playerstats.x = 100;
playerstats.y = 100;

app.post('/playerstats', function(req, res) {
	console.log(req.body);
	playerstats = req.body;
});
app.get('/playerstats', function(req, res){
	res.send(playerstats);
});
app.listen(3000);