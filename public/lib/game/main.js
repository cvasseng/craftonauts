ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'game.entities.otherPlayer',
	'game.entities.player',
	'game.entities.item',
	'game.entities.ai'
)
.defines(function(){

MyGame = ig.Game.extend({

	sfxHeart: new ig.Sound('media/Sound/heartbeat.*'),
	sfxSwordHit: new ig.Sound('media/Sound/Swordhit.*'),
	sfxCrafting: new ig.Sound('media/Sound/crafting.*'),
	sfxConsume: new ig.Sound('media/Sound/consume.*'),
	sfxClick: new ig.Sound('media/Sound/click.*'),

	

	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),

	
	init: function() {
		// Initialize your game here; bind keys etc.
		this.initKeys();
		this.clearColor = '#555';

		this.compass = document.getElementById('compass').getContext('2d');

		miner.spawnEntity = ig.game.spawnEntity;
		ig.music.add( 'media/Sound/Cave.*' );
		ig.music.volume = 0.5;
		ig.music.play();
	},

	initKeys: function(){
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.D, 'right' );
    	ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
		ig.input.bind( ig.KEY.S, 'down' );
		ig.input.bind( ig.KEY.W, 'up' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up' );
		ig.input.bind( ig.KEY.MOUSE1, 'leftClick' );
		//ig.input.bind( ig.KEY.SPACE, 'bomb' );
		ig.input.bind( ig.KEY.E, 'interact');
		ig.input.bind( ig.KEY.SPACE, 'use');
		ig.input.bind( ig.KEY.G, 'drop');
		ig.input.bind( ig.KEY.Q, 'flashlight');
	},

	steerCam: function(){
		var speed = 16;
		if(ig.input.state('leftCam')){
			this.screen.x -= speed;
		} else if (ig.input.state('rightCam')){
			this.screen.x += speed;
		}

		if (ig.input.state('downCam')){
			this.screen.y += speed;
		} else if (ig.input.state('upCam')){
			this.screen.y -= speed;
		}
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		if(!ig.game.player){
			ig.game.player = ig.game.getEntitiesByType(EntityPlayer)[0];
		} else {
			var screenX = this.player.pos.x - ig.system.width/2;
	    	var screenY = this.player.pos.y - ig.system.height/2;	

	        if(screenX < 0){
	            this.screen.x = 0;
	        } else if (screenX > (ig.game.collisionMap.data.length-1)*32){
	        	this.screen.x = (ig.game.collisionMap.data.length-1)*32;
	        } else {
				this.screen.x = screenX;
	        }

	        if (screenY < 0){
	            this.screen.y = 0;
	        } else if (screenY > (ig.game.collisionMap.data.length-1)*32){
	        	this.screen.y = (ig.game.collisionMap.data.length-1)*32;
	        } else{
			//this.screen.y = screenY;
				this.screen.y= screenY;
	        }
		}
        

		// in game update method:
		if( ig.input.pressed( 'leftClick' ) ) {

		    var tileSize = 32, // configure here
		        numMapColumns = ig.game.collisionMap.data.length, // configure here
		        x = ig.game._rscreen.x + ig.input.mouse.x,
		        y = ig.game._rscreen.y + ig.input.mouse.y,
		        row = Math.floor(x/tileSize),
		        col = Math.floor(y/tileSize),
		        index = (row*numMapColumns) + col;
		        miner.blowUp(col, row);
		    // now you know the row, column, and array index of the tile

		}

		// Add your own, additional update code here
	},

	updateSurroundingBlocks: function(y, x){
		var surroundingBlocksSpriteKey = 0;
		var tileAbove = -1;
		var tileBelow = -1;
		if(y>0){
			tileAbove = ig.game.collisionMap.data[y-1][x];
		}
		if(y < (ig.game.collisionMap.data.length-1)){
			tileBelow = ig.game.collisionMap.data[y+1][x];
		}
		
		if ( tileAbove > 0){ // Check if there is a tile above
			surroundingBlocksSpriteKey += 1;
		}

		if ( ig.game.collisionMap.data[y][x-1] !== undefined && ig.game.collisionMap.data[y][x-1]> 0){
			surroundingBlocksSpriteKey += 2;
		}
		
		if ( ig.game.collisionMap.data[y][x+1] !== undefined && ig.game.collisionMap.data[y][x+1]> 0){
			surroundingBlocksSpriteKey += 4;
		}
		
		if (tileBelow > 0){
			surroundingBlocksSpriteKey += 8;
		}

		if(surroundingBlocksSpriteKey === 15){
			if(ig.game.collisionMap.data[y-1][x-1] > 0){
				surroundingBlocksSpriteKey += 1;
			}
			if(ig.game.collisionMap.data[y-1][x+1] > 0){
				surroundingBlocksSpriteKey += 2;
			}
			if(ig.game.collisionMap.data[y+1][x-1] > 0){
				surroundingBlocksSpriteKey += 4;
			}
			if(ig.game.collisionMap.data[y+1][x+1] > 0){
				surroundingBlocksSpriteKey += 8;
			}
		}

		if (ig.game.backgroundMaps[0].data[y][x] !== undefined){
			ig.game.backgroundMaps[0].data[y][x] += surroundingBlocksSpriteKey;
		}
	},


	drawDarkness: function(){

		function addLight (ctx, player, allowTiny, offset) {
			var radius = 260 + (miner.stats().lightrange * 200), x, y;
			if (player && (player.flashlight || typeof allowTiny !== 'undefined')){
				if (!player.flashlight) {
					radius = 40;
				}

				x = (player.pos.x + offset) * 2 - this.screen.x * 2;
				y = (player.pos.y + offset) * 2 - this.screen.y * 2;

				ctx.save();
				ctx.beginPath();
				var dir = player.direction;
				var pulse = player.pulse;
				if (typeof pulse !== 'undefined') {
					pulse = 1 - pulse;
					var t = (new Date()).getTime();
					radius += Math.sin(pulse * (100 + (t / 20))) * 10; 
				}

				if (player.flashlight || allowTiny === true ) {
					ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
				}

				/*
				if ( (player.flashlight || allowTiny === true) && 1 == 2) { // || circleLight
					ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
				} else if (player.flashlight) {
					//Cone light down
					if (dir === 'down') {
						ctx.moveTo(x, y - 10);
						ctx.lineTo(x - 200, y + 250);
						ctx.lineTo(x + 200, y + 250);
					} else if (dir === 'up') {
						ctx.moveTo(x, y + 25);
						ctx.lineTo(x - 200, y - 250);
						ctx.lineTo(x + 200, y - 250);
					} else if (dir === 'left') {
						ctx.moveTo(x + 15, y + 5);
						ctx.lineTo(x - 200, y - 250);
						ctx.lineTo(x - 200, y + 250);
					}  else if (dir === 'right') {
						ctx.moveTo(x - 15, y);
						ctx.lineTo(x + 200, y - 250);
						ctx.lineTo(x + 200, y + 250);
					}
				}
				//*/

				ctx.clip();
				ctx.closePath();
				
				ctx.clearRect(0, 0, 1000, 1000);
				if (typeof pulse !== 'undefined') {
					pulse = (pulse * 100) / 250;
					ctx.fillStyle = 'rgba(200, 30, 30, ' + pulse + ')';
					ctx.fillRect(0, 0, 1000, 1000);
				}
				ctx.restore();
			}
		}

		var ctx = ig.darkness.getContext('2d');
		//ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, ig.system.canvas.width, ig.system.canvas.height);
		var players = miner.getPlayers();
		var offset = 0;
		if (this.player) {
			offset = this.player.size.x / 2;
		}

		players.forEach(function(pl) {
			pl.player.flashlight = pl.flashlight;
			addLight.call(this, ctx, pl.player, false, offset);
		}, this);
		
		if(this.player){
			addLight.call(this, ctx, this.player, true, offset);
		}
		
		ig.system.canvas.getContext('2d').drawImage(ig.darkness, 0, 0, ig.system.canvas.width, ig.system.canvas.height);

	},

	drawCompass: function () {
		var ctx = document.getElementById('compass').getContext('2d');//this.compass;
		ctx.clearRect(0, 0, ig.system.canvas.width, ig.system.canvas.height);

		//Draw a vector in -1..1 space
		function drawVector(x, y) {
			var px = 512 + (x * 512);
			var py = (768 / 2) + (y * (768 / 2));
			var x2 = px + ( (x * -1) * 10);
			var y2 = py + ( (y * -1) * 10);
			var x3 = px - ( (x * -1) * 10);
			var y3 = py - ( (y * -1) * 10);

			ctx.fillStyle = '#FFF';
			ctx.strokeStyle = 'white';

			ctx.beginPath();
			ctx.moveTo(px, py);
			ctx.lineTo(x2, y2);
			ctx.lineTo(x3, y3);
			//ctx.lineTo(px, py);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();


			console.log(px + ',' + py + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3);

		}

		function magnitude (x, y) {
			return Math.sqrt(x * x + y * y) + 0.00001;
		}

		var players = miner.getPlayers();
		if (this.player) {
			players.forEach(function (player) {
				if (player.type === 'player') {
					var x = (player.player.pos.x + (player.player.size.x / 2)) - (this.player.pos.x + (this.player.size.x / 2));
					var y = (player.player.pos.y + (player.player.size.x / 2)) - (this.player.pos.y + (this.player.size.x / 2));
					var mag = magnitude(x, y);
					x /= mag;
					y /= mag;
					drawVector(x, y);
				}
				//ctx.fillRect(100 + (x * 50), 100 + (y * 50), 10, 10);
				//console.log(x + ',' + y);
			}, this);
		}


	//	drawVector(0.8, 0.8);

		ig.system.canvas.getContext('2d').drawImage(document.getElementById('compass'), 0, 0, ig.system.canvas.width, ig.system.canvas.height);
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		this.drawDarkness();
		
		if(this.player){
			if (miner.hasItem('compass')) {
				this.drawCompass();
			}
			this.player.heart.draw();
		}
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
var resX = 512, resY = 384, scale = 2;
ig.main( '#canvas', MyGame, 60, resX, resY, scale );
ig.darkness = document.getElementById('darkness');
ig.darkness.width = resX*scale;
ig.darkness.height = resY*scale;
});
