var colors = require('colors'),
		fs = require('fs'),
		_itemMeta = [],
		_world = require('./me.world');


module.exports = {

	//Create a new item
	createItem: function (name, materialOnly) {
		var itm = _itemMeta.filter(function (itm) {
			return (itm.name === name);
		});
		if (itm.length > 0) {

			if (materialOnly && !itm[0].foundInWorld) {
				return false;
			}


			return {
				id: require('./me.world').nextID(),
				meta: itm[0]
			};
		} else {
			return false;
		}
	},

	//Resolve recipes 
	resolveRecipes: function () {
		//Go through all the things
		_itemMeta.forEach(function(outer) {
			outer.recipes = [];
			_itemMeta.forEach(function(inner) {

				inner.craftInput.forEach(function(input) {
					var inputTweaked = {};
					for (var p in input) {
						if (typeof input[p] !== 'function') {
							inputTweaked[module.exports.getMeta(p).description] = input[p];
						}
					}

					if (typeof input[outer.name] !== 'undefined') {
						//Outer can be used to craft inner.
						outer.recipes.push({
							input: inputTweaked,
							produces: inner.name,
							description: inner.description
						});
					}
				});
			});
		});
		console.log('Resolved plenty of recipes, this gonna be fun..');
	},

	//Create random item
	createRandomItem: function () {
		var ind = Math.floor(Math.random() * _itemMeta.length),
				itm = module.exports.createItem( _itemMeta[ind].name, true);

		if(!itm) {
			return module.exports.createRandomItem();
		}

		return itm;
	},

	//count
	count: function () {
		return _itemMeta.length;
	},

	//Get meta
	getMeta: function(name) {
		var itm = _itemMeta.filter(function (itm) {
			return (itm.name === name);
		});
		if (itm.length > 0) {
			return itm[0];
		} else {
			return false;
		}
	},

	//Load the item definitions
	loadItemDefinitions: function (fn) {
		//Scan the folder
		fs.readdir(__dirname + '/../data/items/', function (err, files) {
			files = files.filter(function (f) {
				return f.indexOf('.json') > 0;
			});

			console.log('Found ' + files.length + ' item definitions, attempting to load them..');

			files.forEach(function(file) {
				//Load the definitions
				fs.readFile(__dirname + '/../data/items/' + file, 'utf-8', function (err, data) {
					if (err) {
						console.log('Error loading item defintion: '.bold.red);
					} else {
						//try {
							var obj = JSON.parse(data);
							_itemMeta.push(obj);
							if (_itemMeta.length === files.length) {
								module.exports.resolveRecipes();
								if (typeof fn === 'function') {
									fn();
								}
							}
							console.log('Loaded awesome item: '.black + obj.description.blue + ' (aka. ' + obj.name + ')');
					//	} catch (e) {
					//		console.log('Error parsing JSON for ' + file + ': ' + e.toString().red);
						//}
					}
				});

			});

		});
	}

};
