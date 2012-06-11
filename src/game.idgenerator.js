//= game.js

if(!GAME_IDGENERATOR) {
(function() {
"use strict"; 

GAME.IDGENERATOR = {}; 
GAME.IDGENERATOR.Id = function(id) {
	this.asNumber = function() {
		return id; 
	};

	this.asColor = function() {
		var r,g,b; 
		b = (id % 128) / 128; 
		g = ((id >> 7) % 128) / 128; 
		r = ((id >> 14) % 128) / 128; 

		return [r,g,b]; 
	};
};

GAME.IDGENERATOR.Id.fromColor = function (r,g,b) {
	var id = 0; 
	id += b >> 1; 
	id += (g >> 1) * 128; 
	id += (r >> 1) * (128 * 128); 

	return new GAME.IDGENERATOR.Id(id); 
};


GAME.IDGENERATOR.Generator = function() {
	var id = 1; 
	this.reset = function() {
		id = 1; 
	};

	this.next = function() {
		return new GAME.IDGENERATOR.Id(id++); 
	};
}

}());
}

var GAME_IDGENERATOR = true; 
