
var express = require('express'),
		app = express(),
		colors = require('colors'),
		server = require('http').createServer(app),
		io = require('socket.io').listen(server, { log: false }),
		_world = require('../lib/me.world'),
		playerFac = require('../lib/me.player'),
		fs = require('fs');

//I like pretty stuff, so print a pretty message.
console.log('');
console.log(fs.readFileSync(__dirname + '/../data/welcome.msg', 'ascii').bold);
console.log('                                            * miner-escape ggj 2013 *'.black.bold);
console.log('');

//Init the world
_world.init(io);


////////////////////////////////////////////////////////////////////////////////

///Net stuff
server.listen(3000);

app.use(express.static(__dirname + '/../public' ));


io.on('connection', function (socket) {

	//////////////////////////////////////////////////////////////////////////////
	// Create and add the player to the world.
	/*
		We keep our player instance here so it's easily accessed.
	*/
	var _player = false;

	//////////////////////////////////////////////////////////////////////////////
	// Handle Disconnects
	socket.on('disconnect', function () {
		if (!_player) {
			return;
		}
		_world.remPlayer(_player);
	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle set tile request
	socket.on('set_tile', function (tile) {
		_world.setTile(tile.tx, tile.tx, tile.data, _player);
	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle movement state change
	socket.on('move_state', function (state) {
		if (!_player) {
			return;
		}

		if (state.name === 'set_vel_x' || state.name === 'set_vel_y') {

			if (state.name === 'set_vel_x') {
				_player.velocity.x = state.velocity;
			} else {
				_player.velocity.y = state.velocity;
			}	
			_player.position.x = state.position.x;
			_player.position.y = state.position.y;
			state.id = _player.id;
			//Broadcast the change to the connected clients
			socket.broadcast.emit('move_state', state);

		//	console.log(JSON.stringify(state));
		}

	});

	socket.on('nickname', function (nick) {
		_player = playerFac.create(socket);
		_player.nickname = nick;
		_world.addPlayer(_player);
	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle use
	socket.on('use_item', function (data) {
		if (!_player) {
			return;
		}

		//Remove from the players inventory
		_player.useItem(data.id, data.tx, data.ty);

	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle drop item
	socket.on('drop_item', function (data) {
		if (!_player) {
			return;
		}

		//Remove from the players inventory
		_player.dropItem(data.id, data.tx, data.ty);

	});

	//////////////////////////////////////////////////////////////////////////////
	// Hanle crafting
	socket.on('craft_item', function (name) {
		if (!_player) {
			return;
		}

		_player.craftItem(name);
	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle attack
	socket.on('attack', function (data) {
		if (!_player) {
			return;
		}

		_world.attackCloseBy(_player);
	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle interaction request
	socket.on('interact', function (tile) {
		if (!_player) {
			return;
		}

		_world.interactWith(tile.tx, tile.ty, _player);
	});

	//////////////////////////////////////////////////////////////////////////////
	// Handle flashlight toggling
	socket.on('toggle_flashlight', function () {
		if (!_player) {
			return;
		}
		
		_player.toggleFlashlight();
	});

});



console.log('Starting server on port 3000');
console.log('');
console.log('Ready for action. Bring it on. SRSLY.'.black.bold);
