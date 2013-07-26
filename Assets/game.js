Game = {};
Game.spritesheet = new Image();
Game.spritesheetinfo = {};
Game.currentFrame = "0001";

$.get("/PCSprite.json", function(data){
    Game.spritesheet.src = "Images/PCSprite.png";
    Game.spritesheet.width = data.meta.w;
    Game.spritesheet.height = data.meta.h;
    Game.spritesheetinfo.frames = data.frames;
    Game.spritesheetinfo.player = {};
    Game.spritesheetinfo.player.sprite = Game.spritesheetinfo.frames["PC-Idle-Left-"+Game.currentFrame+".png"];
    Game.spritesheetinfo.player.height = Game.spritesheetinfo.player.sprite.frame.h;
    Game.spritesheetinfo.player.width = Game.spritesheetinfo.player.sprite.frame.w;
    setup();
    Game.play();
});

(function(){
    function Rectangle(left, top, width, height){
        this.left = left || 0;
        this.top = top || 0;
        this.right = (left + width) || 0;
        this.bottom = (top + height) || 0;
    }

    Rectangle.prototype.set = function(left, top,width,height){
        this.left = left;
        this.top = top;
        this.width = width || this.width;
        this.height = height || this.height;
        this.right = (this.left + this.width);
        this.bottom = (this.top + this.height);
    }

    Rectangle.prototype.within = function(r) {
        return (r.left <= this.left &&
            r.right >= this.right &&
            r.top <= this.top &&
            r.bottom >= this.bottom);
    }

    Rectangle.prototype.overlaps = function(r) {
        return (this.left < r.right &&
            r.left < this.right &&
            this.top < r.bottom &&
            r.top < this.bottom);
    }

    Game.Rectangle = Rectangle;
})();

(function(){

    var AXIS = {
        NONE: "none",
        HORIZONTAL: "horizontal",
        VERTICAL: "vertical",
        BOTH: "both"
    };

    function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
    {
        this.xView = xView || 0;
        this.yView = yView || 0;
        this.xDeadZone = 0;
        this.yDeadZone = 0;
        this.wView = canvasWidth;
        this.hView = canvasHeight;
        this.axis = AXIS.BOTH;
        this.followed = null;
        this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);
        this.worldRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);

    }

    Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone)
    {
        this.followed = gameObject;
        this.xDeadZone = xDeadZone;
        this.yDeadZone = yDeadZone;
    }

    Camera.prototype.update = function()
    {
        if(this.followed != null)
        {
            if(this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
            {
                if(this.followed.x - this.xView  + this.xDeadZone > this.wView)
                    this.xView = this.followed.x - (this.wView - this.xDeadZone);
                else if(this.followed.x  - this.xDeadZone < this.xView)
                    this.xView = this.followed.x  - this.xDeadZone;

            }
            if(this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
            {
                if(this.followed.y - this.yView + this.yDeadZone > this.hView)
                    this.yView = this.followed.y - (this.hView - this.yDeadZone);
                else if(this.followed.y - this.yDeadZone < this.yView)
                    this.yView = this.followed.y - this.yDeadZone;
            }

        }

        this.viewportRect.set(this.xView, this.yView);

        if(!this.viewportRect.within(this.worldRect))
        {
            if(this.viewportRect.left < this.worldRect.left)
                this.xView = this.worldRect.left;
            if(this.viewportRect.top < this.worldRect.top)
                this.yView = this.worldRect.top;
            if(this.viewportRect.right > this.worldRect.right)
                this.xView = this.worldRect.right - this.wView;
            if(this.viewportRect.bottom > this.worldRect.bottom)
                this.yView = this.worldRect.bottom - this.hView;
        }

    }

    Game.Camera = Camera;

})();
(function(){
    function Player(x, y){
        this.x = x;
        this.y = y;
        this.speed = 200;
        this.width = 63;
        this.height = 107;
    }

    Player.prototype.update = function(step, worldWidth, worldHeight){
        if(Game.controls.left)
            this.x -= this.speed * step;
        if(Game.controls.up)
            this.y -= this.speed * step;
        if(Game.controls.right)
            this.x += this.speed * step;
        if(Game.controls.down)
            this.y += this.speed * step;

        if(this.x - this.width/2 < 0){
            this.x = this.width/2;
        }
        if(this.y - this.height/2 < 0){
            this.y = this.height/2;
        }
        if(this.x + this.width/2 > worldWidth){
            this.x = worldWidth - this.width/2;
        }
        if(this.y + this.height/2 > worldHeight){
            this.y = worldHeight - this.height/2;
        }
    }
    Player.prototype.draw = function(context, xView, yView){
        context.save();
        context.drawImage(Game.spritesheet,Game.spritesheetinfo.player.sprite.frame.x,Game.spritesheetinfo.player.sprite.frame.y,Game.spritesheetinfo.player.sprite.frame.w,Game.spritesheetinfo.player.sprite.frame.h,(this.x-this.width/2) - xView, (this.y-this.height/2) - yView, this.width, this.height);
        context.restore();
    }

    Game.Player = Player;


})();

(function(){
    function Map(width, height){
        this.width = width;
        this.height = height;
        this.image = null;
    }

    Map.prototype.generate = function(){
        var ctx = document.createElement("canvas").getContext("2d");
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;

        var rows = ~~(this.width/44) + 1;
        var columns = ~~(this.height/44) + 1;

        var color = "red";
        ctx.save();
        ctx.fillStyle = "red";
        for (var x = 0, i = 0; i < rows; x += 44, i++) {
            ctx.beginPath();
            for (var y = 0, j = 0; j < columns; y += 44, j++) {
                ctx.rect (x, y, 40, 40);
            }
            color = (color == "red" ? "blue" : "red");
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();

        this.image = new Image();
        this.image.src = ctx.canvas.toDataURL("image/png");

        ctx = null;
    }


    Map.prototype.draw = function(context, xView, yView){

        var sx, sy, dx, dy;
        var sWidth, sHeight, dWidth, dHeight;

        sx = xView;
        sy = yView;

        sWidth =  context.canvas.width;
        sHeight = context.canvas.height;

        if(this.image.width - sx < sWidth){
            sWidth = this.image.width - sx;
        }
        if(this.image.height - sy < sHeight){
            sHeight = this.image.height - sy;
        }

        dx = 0;
        dy = 0;

        dWidth = sWidth;
        dHeight = sHeight;

        context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }

    Game.Map = Map;

})();

function animate(){
    Game.currentFrameNum = parseFloat(Game.currentFrame[3]);
    Game.currentFrameNum2 = parseFloat(Game.currentFrame[2]);
    if (Game.currentFrameNum2 === 1 && Game.currentFrameNum === 5){
        Game.currentFrameNum2 = 0;
        Game.currentFrameNum = 1;
    }
    if (Game.currentFrameNum < 9) {
        Game.currentFrameNum++;
    } else {
        Game.currentFrameNum2++;
        Game.currentFrameNum = 0;
    }
    Game.currentFrame = "00" + String(Game.currentFrameNum2) + String(Game.currentFrameNum);
    Game.spritesheetinfo.player.sprite = Game.spritesheetinfo.frames["PC-Idle-Left-"+Game.currentFrame+".png"];
}

function setup(){

    var canvas = document.getElementById("game");
    var context = canvas.getContext("2d");
    canvas.height =  window.innerHeight;
    canvas.width =  window.innerWidth;

    var room = {
        width: 5000,
        height: 3000,
        map: new Game.Map(5000, 3000)
    };

    room.map.generate();

    var player = new Game.Player(50, 50);

    var FPS = 30;
    var INTERVAL = 1000/FPS;
    var STEP = INTERVAL/1000;

    var camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);
    camera.follow(player, canvas.width/2, canvas.height/2);

    var update = function(){
        player.update(STEP, room.width, room.height);
        camera.update();
    }

    var draw = function(){

        context.clearRect(0, 0, canvas.width, canvas.height);

        room.map.draw(context, camera.xView, camera.yView);
        player.draw(context, camera.xView, camera.yView);
    }

    var gameLoop = function(){
        update();
        animate();
        draw();
    }

    Game.play = function(){
     setInterval(function(){
                gameLoop();
            }, INTERVAL);
        }
};

Game.controls = {
    left: false,
    up: false,
    right: false,
    down: false
};

window.addEventListener("keydown", function(e){
    switch(e.keyCode)
    {
        case 65: // left
            Game.controls.left = true;
//            Game.spritesheetinfo.player.sprite = Game.spritesheetinfo.frames["PC-Idle-Left-"+Game.currentFrame+".png"];
            break;
        case 87: // up
            Game.controls.up = true;
            break;
        case 68: // right
            Game.controls.right = true;
//            Game.spritesheetinfo.player.sprite = Game.spritesheetinfo.frames["PC-Idle-Left-"+Game.currentFrame+".png"];
            break;
        case 83: // down
            Game.controls.down = true;
            break;
    }
}, false);

window.addEventListener("keyup", function(e){
    switch(e.keyCode)
    {
        case 65: // left
            Game.controls.left = false;
            break;
        case 87: // up
            Game.controls.up = false;
            break;
        case 68: // right
            Game.controls.right = false;
            break;
        case 83: // down
            Game.controls.down = false;
            break;
    }
}, false);


