var _world = require('./me.world');

var AI = function () {

	//The player that this AI controls 
	var _player = require('./me.player').create(undefined, 'ai');

	_player.controller = 'ai';
	_player.flashlight = false;
	_player.type = 'ai';
	
	//Last action
	var _lastActionTime = 0;
	//Current action counter
	var _actionCounter = 1000;
	//Damaage time
	var _hitTime = 0;
	this.origPosition = {
		x: 0,
		y: 0
	};

	this.player = function () {
		return _player;
	}

	//Tick
	this.tick = function (timeMs, delta) {

		if (!_player.alive()) {
			return;
		}

		if (_lastActionTime = 0) {
			//this.origPosition.x = _player.position.x;
			//this.origPosition.y = _player.position.y;
		}

		if (_player.position.x < 0 || _player.position.y < 0 ||
				_player.position.x > 4800 || _player.position.y > 4800) {
			//_player.position.x = this.origPosition.x;
			//_player.position.y = this.origPosition.y;
		}


		var other = _world.findClosestPlayer(_player, 80);
		if (other) {
			//console.log('AI is chasing!');
			//Enter/continue chase mode
			//Move towards the player
			if (other.distanceToOther(_player) > 10 && other.flashlight) {
				var newVelocity = {
					x: other.position.x - _player.position.x,
					y: other.position.y - _player.position.y
				};

				if (_player.velocity.x !== newVelocity.x)
					_world.broadcast('move_state', {id:_player.id, name:'set_vel_x', velocity: _player.velocity.x, position: _player.position});
				if (_player.velocity.y !== newVelocity.y)
					_world.broadcast('move_state', {id:_player.id, name:'set_vel_y', velocity: _player.velocity.y, position: _player.position});

				_player.velocity = newVelocity;

			} else if (other.distanceToOther(_player) < 10) {
				_player.velocity.x = 0;
				_player.velocity.y = 0;

				_world.broadcast('move_state', {id:_player.id, name:'set_vel_x', velocity: _player.velocity.x, position: _player.position});
				_world.broadcast('move_state', {id:_player.id, name:'set_vel_y', velocity: _player.velocity.y, position: _player.position});

				if (timeMs - _hitTime > 800) {
					other.health -= 0.1;
					_hitTime = timeMs;
					other.send('hit', {damage:0.1});
					_world.broadcast('strike', {id: _player.id, attackData: {damage:0.1}});
				}
			}
			_lastActionTime = 0;
			return;
		} else {
			//Leave chase mode
			//console.log('AI is not chasing!')
		}

		var x = (_player.position.x - 12) + (_player.velocity.x);
		var y = (_player.position.y - 6) + (_player.velocity.y);
		var tx = Math.floor(x  / 32);
		var ty = Math.floor(y / 32);

		if (timeMs - _lastActionTime > _actionCounter) {
			//Ok, we need to preform a new action.
			this.nextAction();
			
			//Create a new action counter
			_actionCounter = (Math.random() * 3000) + 1000;
			_lastActionTime = timeMs;
		}

		//If collision, re roll
		if (_world.collides(tx, ty) === 1 || typeof _world.collides(tx, ty)  === 'undefined') {
			//this.nextAction();
			_player.velocity.x *= -1;
			_player.velocity.y *= -1;
			_world.broadcast('move_state', {id:_player.id, name:'set_vel_x', velocity: _player.velocity.x, position: _player.position});
			_world.broadcast('move_state', {id:_player.id, name:'set_vel_y', velocity: _player.velocity.y, position: _player.position});
			_lastActionTime = timeMs;
			_actionCounter = 1000;
		}

		//Update the player
		//_player.update(delta);

		//console.log(JSON.stringify(_player.position));
	};

	this.nextAction = function () {
		var roll = Math.round(Math.random() * 3);

		//console.log('AI change state');
		//Emit a start move message
	//	if (_player.velocity.x != 0)
		//	_world.broadcast('move_state', {id:_player.id, name:'set_vel_x', velocity: _player.velocity.x, position: _player.position});

		///if (_player.velocity.y != 0)
		//	_world.broadcast('move_state', {id:_player.id, name:'set_vel_y', velocity: _player.velocity.y, position: _player.position});

		switch (roll) {
			case 0: {
				_player.velocity.x = -60;
				_player.velocity.y = 0;
				break;
			}
			case 1: {
				_player.velocity.x = 60;
				_player.velocity.y = 0;
				break;
			}
			case 2: {
				_player.velocity.x = 0;
				_player.velocity.y = -60;
				break;
			}
			case 3: {
				_player.velocity.x = 0;
				_player.velocity.y = 60;
				break;
			}

		}

		_world.broadcast('move_state', {id:_player.id, name:'set_vel_x', velocity: _player.velocity.x, position: _player.position});
		_world.broadcast('move_state', {id:_player.id, name:'set_vel_y', velocity: _player.velocity.y, position: _player.position});

	};

};


module.exports = {
		
		//Create AI
		createAI: function () {
			var ai = new AI();
			_world.addAI(ai);
			return ai;
		}

};
