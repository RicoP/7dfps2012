//= game.js 
//= game.levelmanager.js
//= game.pathhelper.js
//= game.idgenerator.js
//= lib/gl-matrix.js

(function() {
/////////////
var gl = GLT.createSafeContext(document.getElementsByTagName("canvas")[0]); 

var projection = mat4.perspective(75, 4/3, 0.1, 1000); 
var cameraPos = vec3.create([0, 0, 0]); 
var cameraDir = vec3.create([0,0,0]); 
var cameraNormal = vec3.create([0,0,-1]); 
var cameraUp = vec3.create([0,1,0]); 
var camera = mat4.lookAt(cameraPos, vec3.add(cameraPos, cameraNormal, cameraDir), cameraUp); 

var gameobjects = null; 

var program = null; 

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
			GLT.requestGameFrame(draw); 
		}
	); 
}

function setup(mapdata) {
	gl.enable( gl.DEPTH_TEST ); 
	gl.enable( gl.CULL_FACE ); 
	gl.clearColor(0,0,0,1); 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

	cameraPos = vec3.create([mapdata.startpoint.x, 2.0, mapdata.startpoint.y]); 
	recalcCamera(); 
	
	gameobjects = mapdata.gameobjects; 

	for(var y = 0; y != mapdata.grid.length; y++) {
		var row = mapdata.grid[y]; 
		for(var x = 0; x != row.length; x++) {
			var o = row[x]; 
			if(o && o in gameobjects) {
				var obj = gameobjects[o]; 
				if(!obj.entities) {
					obj.entities = []; 
				}

				obj.entities.push( { "position" : {  "x" : x, "y" : y }} ); 				
			}
		}
	}

	program = mapdata.program; 
	gl.useProgram(mapdata.program); 
}

function draw(time) {
	var moved = false; 

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

	if(GLT.keys.isDown(GLT.keys.codes.w)) {
		cameraPos[2] -= 0.1; 
		moved = true; 
	}
	if(GLT.keys.isDown(GLT.keys.codes.s)) {
		cameraPos[2] += 0.1; 
		moved = true; 
	}

	if(GLT.keys.isDown(GLT.keys.codes.a)) {
		cameraPos[0] -= 0.1; 
		moved = true; 
	}
	if(GLT.keys.isDown(GLT.keys.codes.d)) {
		cameraPos[0] += 0.1; 
		moved = true; 
	}

	if(GLT.keys.isDown(GLT.keys.codes.q)) {
		cameraPos[1] += 0.1; 
		moved = true; 
	}
	if(GLT.keys.isDown(GLT.keys.codes.e)) {
		cameraPos[1] -= 0.1; 
		moved = true; 
	}

	if(moved) {
		recalcCamera(); 
	}

	var indxModelView  = gl.getUniformLocation(program, "uModelview") 
	var indxProjection = gl.getUniformLocation(program, "uProjection");
	var indxTexture    = gl.getUniformLocation(program, "uTexture"); 

	for(var name in gameobjects) {
		var gameobject = gameobjects[name]; 
		var entities = gameobject.entities; 

		gl.bindBuffer(gl.ARRAY_BUFFER, gameobject.buffer); 
		gl.bindTexture(gl.TEXTURE_2D, gameobject.texture);
		gl.uniform1i(indxTexture, 0); 

		gl.vertexAttribPointer(gameobject.aVertex, 4, gl.FLOAT, false, gameobject.stride, gameobject.voffset); 
		gl.enableVertexAttribArray(gameobject.aVertex); 

		if(gameobject.schema & GLT.obj.SCHEMA_VT && gameobject.aTextureuv >= 0) {
			gl.vertexAttribPointer(gameobject.aTextureuv, 2, gl.FLOAT, false, gameobject.stride, gameobject.toffset); 
			gl.enableVertexAttribArray(gameobject.aTextureuv); 
		}

		if(gameobject.schema & GLT.obj.SCHEMA_VN && gameobject.aNormal >= 0) {
			gl.vertexAttribPointer(gameobject.aNormal, 4, gl.FLOAT, false, gameobject.stride, gameobject.noffset); 
			gl.enableVertexAttribArray(gameobject.aNormal); 
		}

		for(var i = 0; i != entities.length; i++) { 
			var entity = entities[i]; 
			var modelview = mat4.identity(); 
			mat4.multiply(modelview, camera); 

			mat4.translate(modelview, [entity.position.x, 0, entity.position.y]); 

			if(name === "zombie") {
				mat4.rotateZ(modelview, Math.sin(Date.now() / 1000) / 10  );
			}

			gl.uniformMatrix4fv(indxProjection, false, projection); 
			gl.uniformMatrix4fv(indxModelView, false, modelview); 
			
			gl.drawArrays(gl.TRIANGLES, 0, gameobject.numVertices); 
		}
	}


	GLT.requestGameFrame(draw); 
}

/////////////
}());

