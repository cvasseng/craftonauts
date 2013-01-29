var g_idCounter = 0,
		_world = require('./me.world'),
		_items = require('./me.item');


var Player = function (socket, tp) {

	//////////////////////////////////////////////////////////////////////////////

	//ID of player
	this.id = _world.nextID();
	//The position of the player
	this.position = {
		x:0,
		y:0
	};
	//The velocity of the player
	this.velocity = {
		x: 0,
		y: 0
	};
	//The inventory of the player
	this.inventory = [];
	//The state of the player
	this.state = 'idle';

	//Health
	this.health = 1;
	//Food 
	this.food = 1;
	//Water
	this.water = 1;
	//Pulse
	this.pulse = 1;
	//Oxygen
	this.sanity = 1;
	//lightrange
	this.lightrange = 0.5;
	//Score
	this.score = 0;

	this.nickname = 'Askeladden';

	this.type = typeof tp !== 'undefined' ? tp : 'player';
	this.controller = 'player';

	var _alive = true;

	//Weapon cooldown
	var _weaponCooldown = 0;

	//Flashlight on?
	this.flashlight = true;

	//////////////////////////////////////////////////////////////////////////////
	// Kill
	this.kill = function () {
		_world.broadcast('msg', 'A player has been slain.');
		
		this.dropInventory();
		if (typeof socket !== 'undefined') {
		//	socket.disconnect();
		}
		_alive = false;
		this.send('dead');
	},

	//////////////////////////////////////////////////////////////////////////////
	// Is it alive?
	this.alive = function () {
		return _alive;
	};

	//////////////////////////////////////////////////////////////////////////////
	// Give the player an item
	this.giveItem = function (item) {

		//Add to inventory
		this.inventory.push(item);

		//Send the item to the client
		this.send('get_item', item);
	};

	//////////////////////////////////////////////////////////////////////////////
	// Send stats
	this.sendStats = function () {
		this.send('stats', {
			health: this.health,
			food: this.food,
			sanity: this.sanity,
			water: this.water,
			pulse: this.pulse,
			lightrange: this.lightrange,
			score: this.score
		});
	};

	//////////////////////////////////////////////////////////////////////////////
	// Toggle flashlight
	this.toggleFlashlight = function () {
		this.flashlight = !this.flashlight;
		this.broadcast('flashlight', {id: this.id, flashlight: this.flashlight});
	};

	//////////////////////////////////////////////////////////////////////////////
	// Use item
	this.useItem = function (itemID, tx, ty) {

		var t = (new Date()).getTime();

		//Check if the player has the item
		this.inventory.forEach(function(item) {
			if (item.id === itemID) {
				//console.log('using item');
				this.applyModifiers(item.meta.onactivate);

				if (item.meta.name === 'dynamite') {
					//Blow stuff up at the player pos
					var tx = Math.floor( (this.position.x - 6) / 32);
					var ty = Math.floor( (this.position.y - 12) / 32); 
					_world.blowUp(tx, ty);
				}

				this.sendStats();
				if (item.meta.consumable) {
					this.consumeItem(item.id);
				} else if (item.meta.type === 'weapon') {

					if (t - _weaponCooldown > 750) {
						//Ask the world to preform an attack
						_world.doAttack(this, {
							range:20,
							damage:0.5
						})
						_weaponCooldown = t;
					}
				}
			}
		}, this);

		//this.send('item_use', item);
	};

	//////////////////////////////////////////////////////////////////////////////
	//Distance to other
	this.distanceToOther = function (other) {
		var xd = this.position.x - other.position.x;
		var yd = this.position.y - other.position.y;
		return Math.sqrt( xd*xd + yd*yd );
	};

	//////////////////////////////////////////////////////////////////////////////
	// Consume the item
	this.consumeItem = function (itemID) {
		this.inventory = this.inventory.filter(function(item) {
			if (item.id === itemID) {
				this.send('loose_item', itemID);
				return false;
			}
			return true;
		}, this);
	};

	//Apply modifiers
	this.applyModifiers = function (modifiers) {
		if (typeof modifiers === 'undefined') {
			return;
		}
		
		if (typeof modifiers.health !== 'undefined')
			this.health += modifiers.health;
		if (typeof modifiers.food !== 'undefined')
			this.food += modifiers.food;
		if (typeof modifiers.sanity !== 'undefined')
			this.sanity += modifiers.sanity;
			if (typeof modifiers.water !== 'undefined')
			this.water += modifiers.water;
		if (typeof modifiers.pulse !== 'undefined')
			this.pulse += modifiers.pulse;
		if (typeof modifiers.lightrange !== 'undefined')
			this.lightrange += modifiers.lightrange;
		if (typeof modifiers.score !== 'undefined')
			this.score += modifiers.score;
	};

	//////////////////////////////////////////////////////////////////////////////
	// Drop entire inventory
	this.dropInventory = function () {
		this.inventory.forEach(function(item) {
			var tx = Math.floor( (this.position.x - 6) / 32);
			var ty = Math.floor( (this.position.y - 12) / 32);
			this.dropItem(item.id, tx, ty, true)
		}, this);
	},

	

	//////////////////////////////////////////////////////////////////////////////
	// Drop an item
	this.dropItem = function (itemID, tx, ty, force) {

		if (typeof itemID === 'undefined') {
			return;
		}

		if (_world.itemAt(tx, ty)) {
			if (force) {
				for (var y = ty - 1; y < ty + 1; y++) {
					for (var x = tx - 1; x < tx + 1; x++) {
						if (!_world.itemAt(x, y)) {
							this.dropItem(itemID, x, y, true);
							return;
						}
					}
				}
			}
			return;
		}

		console.log('dropping item ' + itemID);
		//Check if the player has the item
		this.inventory = this.inventory.filter(function(item) {
			if (item.id === itemID) {
				this.applyModifiers(item.meta.ondrop);
				console.log('Spawning item ' + item.meta.name + ' after player lost it.');
				_world.spawnItem(tx, ty, item.meta.name);
				this.send('loose_item', itemID);
				return false;
			}
			return true;
		}, this);
	};

	//////////////////////////////////////////////////////////////////////////////
	// Update
	this.update = function (delta) {
	//	if (this.velocity.x != 0)
		this.position.x += this.velocity.x * delta;
	//	if (this.velocity.y != 0)
		this.position.y += this.velocity.y * delta;

		//console.log(JSON.stringify(this.velocity) + ' ' + delta);

		

	//	console.log(JSON.stringify(this.position));
	},

	//////////////////////////////////////////////////////////////////////////////
	// Craft item
	this.craftItem = function (name) {
		//First find the meta
		var meta = _items.getMeta(name), nohit = false, inputStack = [];
		if (meta) {
			//So far so good. Check if the player has enough stuff.

			meta.craftInput.forEach(function(input) {
				nohit = false;
				for (var p in input) {
					if (typeof input[p] !== 'function') {
						//Count the items
						var itms = this.inventory.filter(function (itm) {
							return itm.meta.name === p;
						}, this);

						//Do we have enough?
						if (itms.length >= input[p]) {
							//Yep. Add enough of them to our input stack
							for (var i = 0; i < input[p]; i++) {
								inputStack.push(itms[i]);
							}

						} else {
							//Nope.
							console.log('no ' + p + ' in inventory..');
							nohit = true;
						}
					}
				}
				if (!nohit) {
					//We have found a way to make it
					console.log('Crafting item ' + name);
					//Ok, so we're good. Remove the inputstack
					inputStack.forEach(function (item) {
						this.consumeItem(item.id);
					}, this);
					
					//Create the result and give it to the player
					var newItem = _items.createItem(name);
					this.giveItem(newItem);
					this.applyModifiers(newItem.meta.oncrafted);

					return true;
				} else {
					console.log(JSON.stringify(input) + ' is not a valid path to the item.. :(');
				}
			}, this);



		}
	};

	//////////////////////////////////////////////////////////////////////////////
	//Send inventory
	this.sendInventory = function () {
		this.inventory.forEach(function(item) {
			this.send('get_item', item);
		}, this);
	};

	//////////////////////////////////////////////////////////////////////////////
	//Send something to the player
	this.send = function (msg, payload) {
		if (typeof socket !== 'undefined') {
			socket.emit(msg, payload);
		}
	};

	//////////////////////////////////////////////////////////////////////////////
	// Broadcast something through the player
	this.broadcast = function (msg, payload) {
		if (typeof socket !== 'undefined') {
			socket.broadcast.emit(msg, payload);
		}
	};

}



////////////////////////////////////////////////////////////////////////////////
// Exports
module.exports = {

	create: function (socket, tp) {
		return new Player(socket, tp);
	}

};
