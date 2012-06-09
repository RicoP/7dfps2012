//= game.js 
//= game.levelmanager.js
//= game.pathhelper.js
//= lib/gl-matrix.js

(function() {
var gl = GLT.createContext(document.getElementsByTagName("canvas")[0]); 

if(DEBUG) {
	console.log("DEBUG Version"); 
} else {
	console.log("RELEASE Version"); 
}

GAME.LEVELMANAGER.loadlevel(
	"map1", 
	gl, 
	function(file, p) {
		console.log(file, p); 
	}, 
	function(files) {
		console.log("done", files); 
	}
); 

}());
