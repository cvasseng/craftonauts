var miner = (function () {

	//List of sprites
	var _sprites = [];
	//Socket
	var _socket = false;
	//Player
	var _player = false;
	//Tilesize
	var _tilesize = 32;
	//Stats
	var _health = 0;
	var _food = 0;
	var _sanity = 0;
	var _pulse = 0;
	var _water = 0;
	var _lightrange = 0.5;
	var _score = 0;

	//Selected item
	var _selectedItem = false;
	//Inventory
	var _inventory = [];

	//Get a player by id
	function resolvePlayer(id) {
		//Find the player
		var player = _sprites.filter(function(pl) {
			return pl.id === id;
		});

		if (player.length > 0) {
			return player[0];
			//Player now contains the target for the move
		} else {
			//Player not found... Fatal error!
			return false;
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// Do splash screen
	function doSplash () {
		var splash = document.getElementById('splash');
		splash.style.display = 'block';
	}

	////////////////////////////////////////////////////////////////////////////
	// Flush 
	function flush() {
		_sprites.forEach(function (pl) {
			pl.player.kill();
		});

		_sprites = [];

		//inventory = [];
		_selectedItem = false;
		_pulse = 0;

		//_player.kill();
		//_player = miner.spawnEntity.call(ig.game, EntityPlayer, 0, 0, {flashlight: true});
	}

	////////////////////////////////////////////////////////////////////////////
	// Build inventory
	function buildInventory () {
		var inventory = document.getElementById('inventory');
		inventory.innerHTML = '';
		_inventory.forEach(function (item) {
				item.node = document.createElement('li');
				item.node.innerHTML = item.item.meta.description;

				//Build tooltip
				var tooltip = '';


				function getTip(title, meta){

					function style(val) {
						val = val * 100;
						if (val < 0) {
							return '<span class="negative">' + val + '</span>';
						}
						return '<span class="positive">+' + val + '</span>';
					}

					if (typeof meta !== 'undefined') {
						var tip = '';
						
						if (meta.health !== 0 && typeof meta.health !== 'undefined') 
							tip += 'Health: ' + style(meta.health) + '<br/>';
						if (meta.food !== 0 && typeof meta.food !== 'undefined') 
							tip += 'Food: ' + style(meta.food) + '<br/>';
						if (meta.water !== 0 && typeof meta.water !== 'undefined') 
							tip += 'Water: ' + style(meta.water) + '<br/>';
						if (meta.sanity !== 0 && typeof meta.sanity !== 'undefined') 
							tip += 'Sanity: ' + style(meta.sanity) + '<br/>';
						if (meta.pulse !== 0 && typeof meta.pulse !== 'undefined') 
							tip += 'Pulse: ' + style(meta.pulse) + '<br/>';

						if (tip != '') {
							tip = '<div style="font-size:16px;">' + title + '</div>' + tip;
						}

						return tip;
					}
					return '';
				} 

				tooltip += getTip('When dropped', item.item.meta.ondrop);
				tooltip += getTip('When close to', item.item.meta.onclose);
				tooltip += getTip('When using', item.item.meta.onactivate);
				tooltip += getTip('When in inventory', item.item.meta.onhave);

				item.node.onmouseover = function () {
					var target = document.getElementById('item-hint');
					target.innerHTML = tooltip;
				};
				
				item.node.onmouseout = function () {
					var target = document.getElementById('item-hint');
					target.innerHTML = '';
				};


				inventory.appendChild(item.node);
				item.node.onclick = function () {
					
					if (_selectedItem) {
						_selectedItem.node.className = '';
					}
					_selectedItem = item;
					if (item.item.meta.name === 'shank') {
						_player.shank = true;
					} else {
						_player.shank = false;
					}
					console.log('selected item #' + item.item.id);
					buildCrafting();
					item.node.className = 'inventory-item-selected';
				};
		});
	}

	////////////////////////////////////////////////////////////////////////////
	// Build crafting pane for selected
	function buildCrafting() {
		var craftlist = document.getElementById('craftlist');
		craftlist.innerHTML = '';
		if (_selectedItem) {
			_selectedItem.item.meta.recipes.forEach(function(recipe) {
				var itmName = document.createElement('div');
				var craftIcon = document.createElement('span');
				var canMake;
				craftIcon.innerHTML = 'Craft';

				craftIcon.onclick = function () {
					//Craft it 
					miner.craftItem(recipe.produces);
					craftlist.innerHTML = '';
				}

				itmName.innerHTML = recipe.description;
				
				craftlist.appendChild(itmName);
				
				canMake = true;
				for (var p in recipe.input) {
					if (typeof recipe.input[p] !== 'undefined') {

						var component = document.createElement('li');
						component.innerHTML = recipe.input[p] + ' ' + p;

						//if (miner.hasItem())
						var has = _inventory.filter(function (itm) {
							return p === itm.item.meta.description;
						});

						if (has.length < recipe.input[p]) {
							component.className = 'negative';
							canMake = false;
						} else {
							component.className = 'positive';
						}

						craftlist.appendChild(component);
					}
				}

				
				if (canMake) {
					itmName.appendChild(craftIcon);
				}

			});

			craftlist.appendChild(document.createElement('br'));
			craftlist.appendChild(document.createElement('br'));

		}	
	}

	function connectAndBind(nickname) {
		//Make our connection
		if (_socket) {
			_socket.socket.disconnect();
			delete _socket;
		}

		_socket = io.connect();

		if (_player) {
			_player.kill();
			
		}
		_player = miner.spawnEntity.call(ig.game, EntityPlayer, 0, 0, {flashlight: true});

		

		////////////////////////////////////////////////////////////////////////////
		//On connect
		_socket.on('connect', function () {
			console.log('Connected to server');
			_socket.emit('nickname', nickname);
		});

		////////////////////////////////////////////////////////////////////////////
		//On disconnect
		_socket.on('disconnect', function () {
			//console.log('Disconnected from server');
			//document.location.reload(true);
			//flush();
			//doSplash();
			connectAndBind(nickname);
		});

		////////////////////////////////////////////////////////////////////////////
		//On map receive 
		_socket.on('map', function (data) {
			console.log('Received map from server');
			//ig.game.unpackMap(mapData);
			ig.game.collisionMap = new ig.CollisionMap( _tilesize, data.collision );
			ig.game.bg = new ig.BackgroundMap( _tilesize, data.background, 'media/terrain_tileset.png' );
			if(ig.game.backgroundMaps[0]){
				ig.game.backgroundMaps.erase(ig.game.backgroundMaps[0]);
			}
			ig.game.backgroundMaps.push(ig.game.bg);
			for (var i = 0; i < data.collision.length; i++) {
				for (var j = 0; j < data.collision[0].length; j++) {
					if(ig.game.collisionMap.data[j][i]>0){
						ig.game.updateSurroundingBlocks(j, i);
					}
				};
			};
			//*/
		});

		////////////////////////////////////////////////////////////////////////////
		// This is called when another player should be spawned
		/*
			attr contains:
				{
					id: int
					friendly: bool,
					position: {
						x:,
						y:
					}
				}
		*/
		_socket.on('spawn', function (attr) {

			//Add to list
			if (attr.type === 'player') {
				attr.player = miner.spawnEntity.call(ig.game, EntityOtherPlayer, attr.position.x, attr.position.y, {
					id: attr.id, 
					friendly: attr.friendly, 
					flashlight: attr.flashlight, 
					shank: false,
					nickname: attr.nickname
				});
				attr.flashlight = attr.flashlight;
				//console.log('Spawned player ' + attr.id);
			} else if (attr.type === 'ai') {
				attr.player = miner.spawnEntity.call(ig.game, EntityAI, attr.position.x, attr.position.y, {
					id: attr.id, 
					friendly: attr.friendly, 
					flashlight: attr.flashlight
				});
				attr.flashlight = attr.flashlight;
		 	} else {
				//console.log('Spawned item ' + attr.id);
				//Note: we need to multiply the position by tilesize when creating the sprite.
				attr.player = miner.spawnEntity.call(ig.game, EntityItem, attr.position.x * _tilesize, attr.position.y * _tilesize, attr);
			}

			_sprites.push(attr);
		
		});

		////////////////////////////////////////////////////////////////////////////
		// Move state update
		_socket.on('move_state', function (attr) {
			//Find the player
			var player = resolvePlayer(attr.id);
			if (player) {
				player.player.pos.x = attr.position.x;
				player.player.pos.y = attr.position.y;
				//Set in impact
				if (attr.name === 'set_vel_x') {
					player.player.vel.x = attr.velocity;
				} else {
					player.player.vel.y = attr.velocity;
				}
			}
			player.player.pos = attr.position;
			//console.log('Received move pack: ' + JSON.stringify(attr));

		});

		////////////////////////////////////////////////////////////////////////////
		// Someone toggled their flashlight
		_socket.on('flashlight', function (attr) {
			//Find the player
			var player = resolvePlayer(attr.id);
			if (player) {
				player.player.flashlight = attr.flashlight;
				player.flashlight = attr.flashlight;
			}
		});

		////////////////////////////////////////////////////////////////////////////
		// Called when another player should be despawned, i.e. removed 
		_socket.on('despawn', function (id) {
			//Find the player
			var player = resolvePlayer(id);
			if (player) {
				//REMOVE FROM IMPACT HERE!
				//ig.game.entities.erase(player.player);
				console.log('despawing ' + id);
				player.player.kill();
			}

			//Remove from our list
			_sprites = _sprites.filter(function (other) {
				return id !== other.id;
			});
		});

		////////////////////////////////////////////////////////////////////////////
		// Called when the stats for the player changes
		_socket.on('stats', function (stats) {
			_health = stats.health;
			_sanity = stats.sanity;
			_food = stats.food;
			_water = stats.water;
			_pulse = stats.pulse;
			_lightrange = stats.lightrange;
			_player.pulse = stats.pulse;
			_score = stats.score;

			document.getElementById('score').innerHTML = _score;

			var health = document.getElementById('stat-health'),
			    food = document.getElementById('stat-food'),
			    water = document.getElementById('stat-water'),
			    maxHeight = 80;

			health.style.height = _health * maxHeight + 'px';    
			food.style.height = _food * maxHeight + 'px';    
			water.style.height = _water * maxHeight + 'px';    

			//console.log(_health / maxHeight);
		//	console.log('Received stats' + JSON.stringify(stats));
		});

		////////////////////////////////////////////////////////////////////////////
		// Called when a player should be moved
		/*
			Attr contains:
				{
					id: int,
					position: {
						x:,
						y:
					}
				}
		*/
		_socket.on('move_self', function (attr) {

				//Valid. Go ahead and move it in impact.
				_player.pos.x = attr.position.x;
				_player.pos.y = attr.position.y;
				console.log('Received move request: ' + JSON.stringify(attr.position));
			
		});

		////////////////////////////////////////////////////////////////////////////
		//Called when dying
		_socket.on('dead', function () {
			_player.die();
			//alert('You have died.');
			//document.location.reload(true);
			flush();
			//doSplash();
			//_socket.disconnect();
			connectAndBind(nickname);
		});
		
		////////////////////////////////////////////////////////////////////////////
		// Called when the player is hit 
		_socket.on('hit', function(data) {
			_player.hit();
		});

		////////////////////////////////////////////////////////////////////////////
		// Called when a player strikes another player
		/*
			{
				
			}

		*/
		_socket.on('strike', function (data) {
			//Find the player
			var player = resolvePlayer(data.id);
			if (player) {
				//This player did a strike
				player.player.strike();
				console.log('strike!');
			}
		
		});

		_socket.on('player_strike', function (data) {
			//This player did a strike
			_player.strike();
			
		});

		////////////////////////////////////////////////////////////////////////////
		// Called when the player receives an item
		_socket.on('get_item', function (itm) {	
			for (var i = 0; i < _inventory.length; i++) {
				if (_inventory[i].item.id === itm.id) {
					return false;
				}
			}
			_inventory.push({node: false, item: itm});
			buildInventory();
		});

		////////////////////////////////////////////////////////////////////////////
		// Called when the player looses an item
		_socket.on('loose_item', function (itm) {
			//Remove from inventory
			_inventory = _inventory.filter(function (b) {
				if (itm === b.item.id) {
					//b.item.node.parentNode.removeChild(b.item.node);
					delete b.item.node;
					console.log('Removed item #' + itm);
					return false;
				}	
				return true;
			});

			buildInventory();

		});



	}



	return {
		doSplash: doSplash,
		//Get stats
		stats: function () {
			return {
				health: _health,
				food: _food,
				water: _water,
				lightrange: _lightrange,
				pulse: _pulse,
				score: _score,
				inventorySize: _inventory.length
			}
		},

		//Connect to the server
		connect: function (nickname) {
			connectAndBind(nickname);
		},

		//Get the players
		getPlayers: function () {
			return _sprites.filter(function(sp) {
				return sp.type === 'player' || sp.type === 'ai';
			});
		},

		//Blow up
		blowUp: function () {
			if (_socket) {
				var tx = Math.floor((_player.pos.x + (_player.size.x / 2)) / _tilesize);
				var ty = Math.floor((_player.pos.y + (_player.size.y / 2)) / _tilesize);
				_socket.emit('use_item', {name:'dynamite', tx: tx, ty: ty});
			}
		},

		//Toggle flashlight
		toggleFlashlight: function () {
			if (_socket) {
				_player.flashlight = !_player.flashlight;
				_socket.emit('toggle_flashlight');
			}
		},

		//Use item
		useItem: function () {
			if (_socket && _selectedItem) {
				var tx = Math.floor((_player.pos.x + (_player.size.x / 2)) / _tilesize);
				var ty = Math.floor((_player.pos.y + (_player.size.y / 2)) / _tilesize);

				_socket.emit('use_item', {name:_selectedItem.item.name, id:_selectedItem.item.id, tx: tx, ty: ty});
				document.getElementById('craftlist').innerHTML = '';
			}
		},

		//Has item?
		hasItem: function (name) {
			return (_inventory.filter(function(itm) {
				return itm.item.meta.name === name;
			})).length > 0;
		},

		//Drop item
		dropItem: function () {
			if (_socket && _selectedItem) {
				var tx = Math.floor((_player.pos.x + (_player.size.x / 2)) / _tilesize);
				var ty = Math.floor((_player.pos.y + (_player.size.y / 2)) / _tilesize);

				_socket.emit('drop_item', {id:_selectedItem.item.id, tx: tx, ty: ty});
				document.getElementById('craftlist').innerHTML = '';
			}
		},

		//Interact with the tile at the player position
		interactWithWorld: function () {
			if (_socket) {
				var tx = Math.floor((_player.pos.x + (_player.size.x / 2)) / _tilesize);
				var ty = Math.floor((_player.pos.y + (_player.size.y / 2)) / _tilesize);
				_socket.emit('interact', {tx: tx, ty: ty});
			}
		},

		setVelX: function (velocity) {
			if (_socket) {
				_socket.emit('move_state', {name:'set_vel_x', velocity: velocity, position: _player.pos});
			}
		},

		setVelY: function (velocity) {
			if (_socket) {
				_socket.emit('move_state', {name:'set_vel_y', velocity: velocity, position: _player.pos});
			}
		},

		craftItem: function (name) {
			if (_socket) {
				_socket.emit('craft_item',  name);
			}
		}

		
	}

})();

