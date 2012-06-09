//= game.js

if(!GAME_PATHHELPER) {
(function() {
"use strict"; 

GAME.PATHHELPER = {}; 

GAME.PATHHELPER.toPathMap = function(name) {
	return "maps/" + name; 	
};

GAME.PATHHELPER.toPathModel = function(name) {
	return "models/" + name; 	
};

}());
}
var GAME_PATHHELPER = true; 
