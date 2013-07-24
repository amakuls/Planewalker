// JavaScript Document

var gameCanvas = document.getElementById("game");
var grafx = gameCanvas.getContext('2d');
var spritesheet = new Image();
spritesheet.src = "assets/images/spritesheet-1.png";
spritesheet.srcX = 48;
spritesheet.srcY = 0;
spritesheet.width = 43;
spritesheet.height = 58;

function player(img,width,height) {
	this.Sprite = new Image();
	this.Sprite.src = img;
	this.Width = width;
	this.Height = height;
	this.Previous_X;
	this.Previous_Y;
	this.Velocity_X = 0;
	this.Velocity_Y = 0;
	this.side = 1;
}

function obstacle(img,x,y,width,height) {
	this.Sprite = new Image();
	this.Sprite.src = img;
	this.X = x;
		this.Y = y;
		this.c = 0;
		this.Width = width;
		this.Height = height;
		this.s = 0;
}

var Player = new player("assets/images/player.png",60,82);
var block = new obstacle("assets/images/block.jpg",0,0,100,100);
$.get("/playerstats", function(data) {
			console.log(data.y);
			Player.Y = data.y;
		}
		);
$.get("/playerstats", function(data) {
			console.log(data.x);
			Player.X = data.x;
			grafx.drawImage(spritesheet,spritesheet.srcX,spritesheet.srcY,spritesheet.width,spritesheet.height,Player.X,Player.Y,spritesheet.width,spritesheet.height);
		}
		);

var isLeft = false;
var isRight = false;
var isUp = false;
var isDown = false;

function keyDown(e) {
	if (String.fromCharCode(e.keyCode)==="%") isLeft = true;
	if (String.fromCharCode(e.keyCode)==="'") isRight = true;
	if (String.fromCharCode(e.keyCode)==="&") isUp = true;
	if (String.fromCharCode(e.keyCode)==="(") isDown = true;
}
function keyUp(e) {
	if (String.fromCharCode(e.keyCode)==="%") isLeft = false;
	if (String.fromCharCode(e.keyCode)==="'") isRight = false;
	if (String.fromCharCode(e.keyCode)==="&") isUp = false;
	if (String.fromCharCode(e.keyCode)==="(") isDown = false;
}

$(document).on("onunload",function(){
	$.post("/playerstats", {x:Player.X,y:Player.Y},function(data) {
			console.log(data);
		}
		);
});

MainLoop ();
function MainLoop() {
	gameCanvas.width =  window.innerWidth;
	gameCanvas.height =  window.innerHeight;
	if ( Player.X + Player.Width > Player.X && Player.X < block.X + block.Width && Player.Y < block.Y + block.Height && Player.Y + Player.Height > block.Y) {
		block.c = 1;   //player is currently colliding with block
	}
	else {
		block.c = 0;   //player is not colliding with block
	}
		
	if ( Player.X + Player.Width < block.X ) {
		block.s = 1;   //player is on the left side of the block
	}
	if ( Player.X > block.X + block.Width ) {
		block.s = 2;   //player is on the right side of the block
	}
	if ( Player.Y + Player.Height < block.Y ) {
		block.s = 3;   //player is on top of the block
	}
	if ( Player.Y > block.Y + block.Height) {
		block.s = 4;   //player is below the block
	}

	if ( block.c == 1 ) {
		if ( Player.X + Player.Width > block.X && block.s == 1 ) {
			Player.X = block.X - Player.Width; //player is coming from left side, so we stop player Lwhere player is at
		}
		else if ( Player.X < block.X + block.Width && block.s == 2 ) {
			Player.X = block.X + block.Width; ///player is coming from right side, so we stop player where player is at
		}
		else if ( Player.Y < block.Y + block.Height && block.s == 4 ) {
			Player.Y = block.Y + block.Height; //player is coming from below, so we stop player where player is at
		}
		else if ( Player.Y + Player.Height > block.Y && block.s == 3 ) {
			Player.Y = block.Y- Player.Height; //player is coming from above, so we stop player where player is at
		}
	}

	if (isUp) {Player.Velocity_Y = -2.25;Player.side=2;}
	if (isDown) {Player.Velocity_Y = 2.25;Player.side=1;}
	if (isLeft) {Player.Velocity_X = -2.25;Player.side=3;}
	if (isRight) {Player.Velocity_X = 2.25;Player.side=4;}
	if (!isLeft && !isRight) Player.Velocity_X = 0;
	if (!isUp && !isDown) Player.Velocity_Y = 0;

	if (Player.side===2){
		spritesheet.srcX=0;
		spritesheet.srcY=65;
		}
	if (Player.side===1){
		spritesheet.srcX=46;
		spritesheet.srcY=0;
		}
	if (Player.side===3){
		spritesheet.srcX=3;
		spritesheet.srcY=4;
		}
	if (Player.side===4){
		spritesheet.srcX=46;
		spritesheet.srcY=65;
		}

	Player.X += Player.Velocity_X;
	Player.Y += Player.Velocity_Y;

	grafx.clearRect(0,0,gameCanvas.width,gameCanvas.height);
	grafx.drawImage(spritesheet,spritesheet.srcX,spritesheet.srcY,spritesheet.width,spritesheet.height,Player.X,Player.Y,spritesheet.width,spritesheet.height);
	grafx.drawImage(block.Sprite,block.X,block.Y);
	requestAnimationFrame(MainLoop);
}

