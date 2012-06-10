//= game.js

if(!GAME_IDGENERATOR) {
(function() {
"use strict"; 

GAME.IDGENERATOR = {}; 
GAME.IDGENERATOR.Generator = function() {
	var id = 0; 
	this.reset = function() {
		id = 0; 
	};

	this.next = function() {
		var current = id++; 
		return {
			"asNumber" : function() {
				return current; 
			},
			"asColor" : function() {
				var r,g,b; 
				b = (current % 128) / 128; 
				g = ((current >> 7) % 128) / 128; 
				r = ((current >> 14) % 128) / 128; 

				return [r,g,b]; 
			}
		};
	};
}

}());
}
var GAME_IDGENERATOR = true; 
