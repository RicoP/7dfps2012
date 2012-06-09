//= game.js 
//= game.levelmanager.js
//= game.pathhelper.js
//= lib/gl-matrix.js

(function() {
/////////////

var gl = GLT.createContext(document.getElementsByTagName("canvas")[0]); 

var projection = mat4.perspective(75, 4/3, 0.1, 1000); 
var cameraPos = vec3.create([0, 0, 0]); 
var cameraDir = vec3.create([0,0,0]); 
var cameraNormal = vec3.create([0,0,-1]); 
var cameraUp = vec3.create([0,1,0]); 
var camera = mat4.lookAt(cameraPos, vec3.add(cameraPos, cameraNormal, cameraDir), cameraUp); 

var entities = []; 

loadData("map1"); 

function recalcCamera() {
	camera = mat4.lookAt(cameraPos, vec3.add(cameraPos, cameraNormal, cameraDir), cameraUp); 
}

function loadData(mapname) {
	if(DEBUG) {
		console.log("DEBUG Version"); 
	} else {
		console.log("RELEASE Version"); 
	}

	GAME.LEVELMANAGER.loadlevel(
		mapname, 
		gl, 
		function(file, p) {
			console.log(file, p); 
		}, 
		function(mapdata) {
			setup(mapdata); 
			//GLT.requestGameFrame(draw); 
		}
	); 
}

function setup(mapdata) {
	gl.enable( gl.DEPTH_TEST ); 
	gl.enable( gl.CULL_FACE ); 
	gl.clearColor(0,0.5,0,1); 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

	cameraPos = vec3.create([mapdata.startpoint.x, 1.8, mapdata.startpoint.y]); 
	recalcCamera(); 

	for(var y = 0; y != mapdata.grid.length; y++) {
		var row = mapdata.grid[y]; 
		for(var x = 0; x != row.length; x++) {
			var o = row[x]; 
			if(o && o in mapdata.gameobjects) {
				var gameobj = {
					"data" : mapdata.gameobjects[o], 
					"position" : { "x" : x, "y" : y }
				};
				entities.push(gameobj); 
			}
		}
	}
	
	gl.useProgram(mapdata.program); 
}

function draw(time) {
	var moved = false; 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

	if(GLT.keys.isDown(GLT.keys.codes.w)) {
		cameraPos[2] += 0.1; 
		moved = true; 
	}
	if(GLT.keys.isDown(GLT.keys.codes.s)) {
		cameraPos[2] -= 0.1; 
		moved = true; 
	}

	if(moved) {
		camera = mat4.lookAt(cameraPos, vec3.add(cameraPos, cameraNormal, cameraDir), cameraUp); 
	}

	var indxModelView  = gl.getUniformLocation(program, "uModelview") 
	var indxProjection = gl.getUniformLocation(program, "uProjection");
	var indxTexture    = gl.getUniformLocation(program, "uTexture"); 

	modelview = mat4.identity(); 
	
	gl.bindTexture(gl.TEXTURE_2D, texture); 
	gl.uniform1i(indxTexture, 0); 

	gl.uniformMatrix4fv(indxProjection, false, projection); 
	gl.uniformMatrix4fv(indxModelView, false, modelview); 

	gl.drawArrays(gl.TRIANGLES, 0, entity.numVertices); 

	GLT.requestGameFrame(draw); 
}

/////////////
}());

