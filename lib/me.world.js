//Noise code shamelessly stolen from http://sirisian.com/javascriptgame/tests/valuenoise2.html

function ValueNoise(width, height, startOctave, endOctave, persistence, smoothAmount, postprocess) {
	var valueNoiseMap = new Float32Array(width * height);

	// We're storing the random data samples in a quadtree
	// octave 0 is the whole area
	// octave 1 is the area divided by 4
	// octave n is the previous octave with each area divided by 4
	var startOctave = 3;
	// Go to the pixel level. This algorithm assumes base 2 area
	var endOctave = 7; //Math.log(width) / Math.log(2) - 2;

	// We need 4 points to do bilinear interpolation from for the noise generation for each octave.
	// This is the summation of Math.pow(2, i + 1) - Math.pow(2, i) + 1 which represents the
	// number of corners per depth of a quadtree. So depth zero has 4 and depth one has 9.
	var nodeCount = 1 / 3 * (3 * (endOctave + 1) + 3 * Math.pow(2, (endOctave + 1) + 2) + Math.pow(2, 2 * (endOctave + 1) + 2) - 4) -
	                1 / 3 * (3 * startOctave + 3 * Math.pow(2, startOctave + 2) + Math.pow(2, 2 * startOctave + 2) - 4);

	var randomTree = new Float32Array(nodeCount);
	for (var i = 0; i < randomTree.length; ++i)
	{
		randomTree[i] = Math.random();
	}
	// Make it tileable
	for (var i = startOctave; i <= endOctave; ++i)
	{
		var octaveSize = Math.pow(2, i + 1) - Math.pow(2, i) + 1;
		var indexOffset = 1 / 3 * (3 * i  + 3 * Math.pow(2, i + 2) + Math.pow(2, 2 * i + 2) - 4) -
	                         1 / 3 * (3 * startOctave + 3 * Math.pow(2, startOctave + 2) + Math.pow(2, 2 * startOctave + 2) - 4);
		for(var y = 0; y < octaveSize; ++y)
		{
			randomTree[indexOffset + y * octaveSize] = randomTree[indexOffset + y * octaveSize + octaveSize - 1];
		}

		for(var x = 0; x < octaveSize; ++x)
		{
			randomTree[indexOffset + x] = randomTree[indexOffset + (octaveSize - 1) * octaveSize + x];
		}
	}

	for(var y = 0; y < height; ++y)
	{
		for(var x = 0; x < width; ++x)
		{
			valueNoiseMap[y * width + x] = 0;
			for (var i = startOctave; i <= endOctave; ++i)
			{
				var cellSize = width / Math.pow(2, i);

				var integerX = Math.floor(x / cellSize);
				var integerY = Math.floor(y / cellSize);
				var indexOffset = 1 / 3 * (3 * i  + 3 * Math.pow(2, i + 2) + Math.pow(2, 2 * i + 2) - 4) -
				                  1 / 3 * (3 * startOctave + 3 * Math.pow(2, startOctave + 2) + Math.pow(2, 2 * startOctave + 2) - 4);
		
				
				var fractionalX = (x - integerX * cellSize) / cellSize;
				var fractionalY = (y - integerY * cellSize) / cellSize;
				//Log(cellSize + " " + fractionalX + " " + fractionalY);
				var octaveSize = Math.pow(2, i + 1) - Math.pow(2, i) + 1;
				var i1 = Interpolate(randomTree[indexOffset + integerY * octaveSize + integerX],
				                     randomTree[indexOffset + integerY * octaveSize + integerX + 1],
				                     fractionalX);
				var i2 = Interpolate(randomTree[indexOffset + (integerY + 1) * octaveSize + integerX],
				                     randomTree[indexOffset + (integerY + 1) * octaveSize + integerX + 1],
				                     fractionalX);

				valueNoiseMap[y * width + x] += Interpolate(i1 , i2 , fractionalY) * Math.pow(persistence, i - startOctave);
				// Smooth and then normalize at the very end
			}
		}
	}

	Smooth(width, height, valueNoiseMap, smoothAmount);

	Normalize(width, height, valueNoiseMap, 0, 1);

	if (postprocess)
	{
		postprocess(valueNoiseMap);
	}

	return valueNoiseMap;
}

function Smooth(width, height, noise, amount)
{
	// Smooth
	for (var i = 0; i < amount; ++i)
	{
		for (var y = 0; y < height; ++y)
		{
			for(var x = 0; x < width; ++x)
			{
				var xMinus1 = x == 0 ? width - 1 : x - 1;
				var yMinus1 = y == 0 ? height - 1 : y - 1;
				var xPlus1 = (x + 1) % width;
				var yPlus1 = (y + 1) % height;
				var corners = (noise[yMinus1 * width + xMinus1] + 
				               noise[yMinus1 * width + xPlus1] + 
				               noise[yPlus1 * width + xPlus1] + 
				               noise[yPlus1 * width + xMinus1]) / 16.0;
				var sides   = (noise[y * width + xMinus1] + 
				               noise[y * width + xPlus1] + 
				               noise[yMinus1 * width + x] + 
				               noise[yPlus1 * width + x]) / 8.0;
				var center  = noise[y * width + x] / 4.0;
				noise[y * width + x] = corners + sides + center;
			}
		}
	}
}

function Normalize(width, height, noise, minimum, maximum) {
	var min = Number.MAX_VALUE;
	var max = -Number.MAX_VALUE;

	// Calculate min and max range used to normalize with
	for (var y = 0; y < height; ++y) {
		for(var x = 0; x < width; ++x) {
			min = Math.min(min, noise[y * width + x]);
			max = Math.max(max, noise[y * width + x]);
		}
	}

	// Normalize the range to 0 to 1
	for (var y = 0; y < height; ++y) {
		for(var x = 0; x < width; ++x) {
			noise[y * width + x] = (noise[y * width + x] - min) / (max - min) * (maximum - minimum) + minimum;
		}
	}
}

function Interpolate(a, b, x) {
	var ft = x * 3.1415927;
	var f = (1 - Math.cos(ft)) * 0.5;
	return a * (1 - f) + b * f;
}

////////////////////////////////////////////////////////////////////////////////
//Tilesize
var _tilesize = 32;
//Actual map data
var _map = [];
//Collision map
var _collisionMap = [];
//Map size, in tiles
var _size = {w: 140, h: 140};
//Players
var _players = [];
//Socket
var _socket = undefined;
//Resource map
var _resourceMap = [];
//Item map - used to check for collisions
var _itemMap = [];
//Item map - this is what's sent to players
var _itemMapFlat = [];
//Active items
/*
	Items with a countdown
*/
var _activeItems = [];

//Items mod
var _itemFact = require('./me.item.js');
//Last real tick
var _lastRealTick = 0;

var _uid = 0;

//Spawn points
var _spawnPoints = [];

//Delta
var _delta = 0;
//Last frame start
var _lastFrameStart = 0;

var _ai = [];

//var _aiFac = require('./me.ai.js');


////////////////////////////////////////////////////////////////////////////////
// World tick
function tick() {
	//Get the epoch time
	var timeMS = (new Date()).getTime(),
			proxItems
	;

	_delta = (timeMS - _lastFrameStart) / 1000;

	_lastFrameStart = timeMS;

	_ai.forEach(function (ai) {
		ai.tick(timeMS, _delta);
	});

	//Update players
	_players.forEach(function (player) {

		if ((player.health <= 0  && player.type === 'ai') || (player.pulse <= 0 && player.type === 'player')) {
			//Dead.
			player.kill();
			remPlayer(player);
			
			
		} else {
			player.update(_delta);
		}

	});

	_activeItems = _activeItems.filter(function(itm) {
		//Are we done counting down? If so, activate the item and return false.
		//Else, return true.

		return true;

	});

	if ( timeMS - _lastRealTick > 2000) {

		_players.forEach(function (player) {
			proxItems = getProximityItems(player);

			player.pulse += (((player.health * 3) + player.water + player.food) / 31.25) - 0.1;

			if (!player.flashlight) {
				player.pulse -= 0.1;
			} else {
	
				if (player.pulse > 1) {
					player.pulse = 1;
				}
			}

			//Apply modifiers from proximity items
			proxItems.forEach(function (item) {
				player.applyModifiers(item.meta.onclose);
			});

			//Apply modifiers from inventory items
			player.inventory.forEach(function (item) {
				if (typeof item.meta !== 'undefined') {
					player.applyModifiers(item.meta.onhave);
				}
			});

			//Degen
		//	player.health -= 0.006;
			player.food -=  0.006;
			player.water -=  0.006;

			//Send the bar content to the player
			player.sendStats();

		});


		_lastRealTick = timeMS;
	}

	//Preform next tick
	setTimeout(tick, 500);
}

////////////////////////////////////////////////////////////////////////////////
// Return items close to a player
function getProximityItems(player) {
	var tx = Math.floor(player.position.x / _tilesize),
			ty = Math.floor(player.position.y / _tilesize);


	return _itemMapFlat.filter(function (itm) {
		var xd = itm.tx - tx;
		var yd = itm.ty - ty;

		itm.meta.proximityRadius = typeof itm.meta.proximityRadius === 'undefined' ? 0: itm.meta.proximityRadius;
		return Math.sqrt( xd*xd + yd*yd ) < itm.meta.proximityRadius;
	});

}

////////////////////////////////////////////////////////////////////////////////
// Initialize map
function initMap(io) {
	_socket = io;

	var tile, roll;

	_itemFact.loadItemDefinitions(function () {

		var valueNoiseMap = ValueNoise(_size.w, _size.h, 3, 7, 0.6, 20, function(noise) {
			for (var y = 0; y < _size.h; ++y) {
				for(var x = 0; x < _size.w; ++x){
					noise[y * _size.w + x] = noise[y * _size.w + x] > 0.32 && noise[y * _size.w + x] < 0.55 ? 0 : 1;
				}
			}
		});

		for (var y = 0; y < _size.h; y++) {
			_map[y] = [];
			_collisionMap[y] = [];
			_itemMap[y] = [];
			for (var x = 0; x < _size.w; x++) {
				tile = valueNoiseMap[x + y * _size.w];
				if (tile === 0) {
					//Floor
					tile = 1;
					roll = Math.round(Math.random() * 1000);
					//Do a throw, see if we should spawn an item
					if (roll < 50) {
						spawnItem(x, y);
					}  
					if (roll < 3 && y > 10) {
						_spawnPoints.push({tx:x, ty:y});
					}
				} else {
					//Wall
					tile = 3;
				}
				
			//	if (y === 0 || y === _size.h - 1 || x === 0 || x === _size.w - 1) {
				//	_map[y][x] = 3;
			//	//	_collisionMap[y][x] = 1;
				//} else {
					_map[y][x] = tile;
					_collisionMap[y][x] = valueNoiseMap[x + y * _size.w];
				//}
			}
		}

		console.log('Generated extremely awesome map.'.bold.black);

		//Start doing ticks
		console.log('Tick tack, lobster attack: Game loop started..');
		tick();

		//Create test ai
		//var ai = _aiFac.create();
		for (var i = 0; i < 15; i++) {
			require('./me.ai').createAI();
		}
	});
}

////////////////////////////////////////////////////////////////////////////////
// Add player to map
function addPlayer(player) {
	//When adding a player, send that player the map
	player.send('map',{background: _map, collision: _collisionMap});
	//Find a spawn point 
	var spoint = _spawnPoints[0];//_spawnPoints[Math.round(Math.random() * _spawnPoints.length)];
	

	if (player.controller === 'ai') {
		spoint = _spawnPoints[Math.floor(Math.random() * _spawnPoints.length)];
		_ai.forEach(function (ai) {
			if (ai.player().id === player.id) {
				ai.origPosition.x = spoint.tx * _tilesize;
				ai.origPosition.y = spoint.ty * _tilesize;
				return true;
			}
		});
	}
		
	//}

	player.position.x = spoint.tx * _tilesize;
	player.position.y = spoint.ty * _tilesize;


	player.giveItem(_itemFact.createItem('rock'));
	player.giveItem(_itemFact.createItem('match'));
	player.giveItem(_itemFact.createItem('wood'));

	//Send the position of the player 
	player.send('move_self', {position: player.position, id: player.id});

	//Spawn the player on the other players
	player.broadcast('spawn', {
		type: player.type,
		flashlight:player.flashlight,
		id: player.id,
		friendly: true,
		nickname: player.nickname,
		position: player.position,
		velocity: player.velocity
	});

	//Send all the existing players to the new player
	_players.forEach(function (pl) {
		player.send('spawn', {
			type: pl.type,
			id: pl.id,
			flashlight:pl.flashlight,
			friendly: true,
			nickname: pl.nickname,
			position: pl.position,
			velocity: pl.velocity
		});
	});

	//Send all items to the player
	_itemMapFlat.forEach(function (item) {
		player.send('spawn', {
			id: item.id,
			type: 'item',
			meta: item.meta,
			position: {
				x: item.tx,
				y: item.ty
			}
		});
	});

	player.sendInventory();

	//Send the bar content to the player
	player.sendStats();

	_players.push(player);

	console.log('Player #' + player.id + ' joined the world.. :)');
}

////////////////////////////////////////////////////////////////////////////////
// Remove player from the world
function remPlayer(player) {

	//Remove the player from the list
	_players = _players.filter(function (b) {
		return b.id !== player.id;
	});

	//Broadcast the despawn
	_socket.sockets.emit('despawn', player.id);

	console.log('Player #' + player.id + ' left the world.. :(');

}

////////////////////////////////////////////////////////////////////////////////
// Spawn an item
function spawnItem (tx, ty, itemName) {

	if (typeof _itemMap[ty][tx] !== 'undefined') {
		return;
	}

	var item;
	if (typeof itemName === 'undefined') {
		//Random.
		item = _itemFact.createRandomItem();
	} else {
		item = _itemFact.createItem(itemName);
	}

	//Add it to the item map
	item.tx = tx;
	item.ty = ty;
	_itemMap[ty][tx] = item;
	_itemMapFlat.push(item);

	//Now spawn it on the clients
	_socket.sockets.emit('spawn', {
		id: item.id,
		type: 'item',
		meta: item.meta,
		position: {
			x: tx,
			y: ty
		}
	});

	//console.log('Spawned item ' + item.meta.name + ' at [' + tx + ',' + ty + ']');
}

////////////////////////////////////////////////////////////////////////////////
// Set tile
function setTile(tx, ty, t, player) {
	if (tx > 0 && tx < _size.w && ty > 0 && ty < _size.h) {

		console.log('Player #' + player.id + ' set the tile at [' + tx + ',' + ty + '] to ' + t);
	}
}

////////////////////////////////////////////////////////////////////////////////
// Blow up part of the map
function blowUp(tx, ty) {
	var startX = tx - 2, 
			stopX = tx + 2,
			startY = ty - 2,
			stopY = ty + 2;

	if (startX < 0) startX = 0; 
	if (startY < 0) startY = 0; 
	if (stopY > _size.h) stopY = _size.h;
	if (stopY > _size.w) stopx = _size.w;

	//Update map
	for (y = startY; y < stopY; y++) {
		for (x = startX; x < stopX; x++) {
			_map[y][x] = 1;
			_collisionMap[y][x] = 0;
		}
	}

	//Log
	console.log('Blowing stuff up at [' + tx + ',' + ty + ']');

	//Emit the map
	_socket.sockets.emit('map', {background: _map, collision: _collisionMap});
}

////////////////////////////////////////////////////////////////////////////////
// Preform an attack
function doAttack (instegator, attackData) {
	//Find closest target
	var closest = {
		player: false,
		distance: 1000
	};

	//Broadcast strike animation
	_socket.sockets.emit('strike', {id: instegator.id, attackData: attackData});
	instegator.send('player_strike', {id: instegator.id, attackData: attackData});

	_players.forEach(function(player) {
		if (player.id !== instegator.id) {
			var dist = instegator.distanceToOther(player);
			if (dist < closest.distance) {
				closest.distance = dist;
				closest.player = player;
			}
		}
	});

	if (closest.player) {
		if (closest.distance < attackData.range) {
			//We have an attack.
			closest.player.health -= attackData.damage;
			closest.player.send('hit', attackData);
			if (closest.player.health <= 0) {
				instegator.score += 10;
			} else {
				instegator.score += 5;
			}
			
		} else {

		}
	}

}

////////////////////////////////////////////////////////////////////////////////
// Interact with a tile
function interactWith(tx, ty, player) {

	//Check if there's an item
	var itm = _itemMap[ty][tx];
	if (typeof itm !== 'undefined') {
		console.log('Player interacted with item');
		//Remove the item from the map
		_itemMap[ty][tx] = undefined;
		_itemMapFlat = _itemMapFlat.filter(function (i) {
			return i.id !== itm.id;
		});

		//Despawn
		_socket.sockets.emit('despawn', itm.id);
		//Give the item to the player
		player.giveItem(itm);

	}


	console.log('Player #' + player.id + ' interacted with tile at [' + tx + ',' + ty + ']');
}

////////////////////////////////////////////////////////////////////////////////
module.exports = {
	//Broadcast
	broadcast: function (msg, data) {
		_socket.sockets.emit(msg, data);
	},
	//Init map
	init: initMap,
	//Add player to map
	addPlayer: addPlayer,
	//Remove player from the map
	remPlayer: remPlayer,
	//Interact
	interactWith: interactWith,
	//Set tile
	setTile: setTile,
	//Blow up
	blowUp: blowUp,
	//Spawn item
	spawnItem: spawnItem,
	//Attack
	doAttack: doAttack,
	collides: function (tx, ty) {
		if (tx > 2 && ty > 2 && tx < _size.w && ty < _size.h)
			return _collisionMap[ty][tx];
		return 0;
	},
	//Get next it
	nextID: function () {
		_uid++;
		return _uid;
	},
	//Item at?
	itemAt: function(tx, ty) {
		return (typeof _itemMap[ty] !=='undefined' && typeof _itemMap[tx][ty] !== 'undefined');
	},
	//add ai
	addAI: function (ai) {
		_ai.push(ai);
		addPlayer(ai.player());
	},
	findClosestPlayer: function (target, dist) {
		var closest = {
			player: false,
			distance: 1000
		};

		_players.forEach(function(player) {
			if (player.id !== target.id && player.controller === 'player') {
				var dist = target.distanceToOther(player);
				if (dist < closest.distance) {
					closest.distance = dist;
					closest.player = player;
				}
			}
		});

		if (closest.player) {
			if (closest.distance < dist) {
				//We have an attack.
				return closest.player;
			} else {

			}
		}
		return false;
	}

};
