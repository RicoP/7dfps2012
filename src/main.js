(function() {
//= game.js 
//= game.levelmanager.js
//= game.pathhelper.js
//= game.idgenerator.js
//= lib/glconstants.js
//= lib/gl-matrix.js

(function() {
"use strict"; 
/////////////
var canvas = document.getElementsByTagName("canvas")[0];
var gl = GLT.createSafeContext(canvas); 

var mousepos = {x:0,y:0}; 
var mousewasmoved = false; 

var pickedId = 0; 

canvas.onmousedown = function(e) {
	var x = e.pageX - this.offsetLeft;
	var y = canvas.height - e.pageY - this.offsetTop;
	mousewasmoved = true; 
	mousepos = { "x" : x, "y" : y }; 	
};

var projection = mat4.perspective(75, 4/3, 0.1, 1000); 
var cameraPos = vec3.create([0, 0, 0]); 
var cameraDir = vec3.create([0,0,0]); 
var cameraNormal = vec3.create([0,0,-1]); 
var cameraUp = vec3.create([0,1,0]); 
var camera = mat4.lookAt(cameraPos, vec3.add(cameraPos, cameraNormal, cameraDir), cameraUp); 

var gameobjects = null; 
var weapon = null; 

var colorprogram = null; 
var idprogram = null; 

var render = true; 

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
	gl.enable( GL_DEPTH_TEST ); 
	gl.enable( GL_CULL_FACE ); 
	gl.clearColor(0,0,0,1); 

	cameraPos = vec3.create([mapdata.startpoint.x, 3.0, mapdata.startpoint.y]); 
	recalcCamera(); 

	gameobjects = mapdata.gameobjects; 
	var gen = new GAME.IDGENERATOR.Generator(); 

	for(var y = 0; y != mapdata.grid.length; y++) {
		var row = mapdata.grid[y]; 
		for(var x = 0; x != row.length; x++) {
			var o = row[x]; 
			if(o && o in gameobjects) {
				var obj = gameobjects[o]; 
				if(!obj.entities) {
					obj.entities = []; 
				}

				var id = gen.next(); 
				obj.entities.push( { "position" : {  "x" : x, "y" : y }, "id" : id } ); 
			}
		}
	}

	weapon = mapdata.weapon; 
	colorprogram = mapdata.program; 
	idprogram = mapdata.idprogram; 
}

function draw(time) {
	update(time); 
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

	if(render) {
		if(mousewasmoved) { 
			mousewasmoved = false; 

			//Draw Picker Buffer 
			drawobjects(time, idprogram); 

			var buf = new Uint8Array(4); 
			gl.readPixels(mousepos.x, mousepos.y, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, buf); 

			var r,g,b; 

			r = buf[0]; 
			g = buf[1]; 
			b = buf[2]; 

			pickedId = new GAME.IDGENERATOR.Id.fromColor(r,g,b).asNumber(); 

			console.log(r,g,b); 
			gl.clear(gl.DEPTH_BUFFER_BIT); 
		}
		
		//Draw Render Buffer 
		drawobjects(time, colorprogram); 
	}

	gl.clear(gl.DEPTH_BUFFER_BIT); 
	drawWeapon(); 

	GLT.requestGameFrame(draw); 
}

function update(time) {
	var moved = false; 

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

	if(GLT.keys.isDown(GLT.keys.codes.p)) {
		render = !render; 
	}
}

function drawobjects(time, program) {
	gl.useProgram(program); 

	var uModelView  = gl.getUniformLocation(program, "uModelview") 
	var uProjection = gl.getUniformLocation(program, "uProjection");
	var uTexture    = gl.getUniformLocation(program, "uTexture"); 
	var uIdColor    = gl.getUniformLocation(program, "uIdColor"); 
	var uHighlight  = gl.getUniformLocation(program, "uHighlight"); 
			
	var modelview = mat4.identity(); 

	for(var name in gameobjects) {
		var gameobject = gameobjects[name]; 
		var entities = gameobject.entities; 

		gl.bindBuffer(gl.ARRAY_BUFFER, gameobject.buffer); 
		gl.bindTexture(gl.TEXTURE_2D, gameobject.texture);
		if(uTexture) { 
			gl.uniform1i(uTexture, 0); 
		}

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
			mat4.identity(modelview); 
			mat4.multiply(modelview, camera); 

			mat4.translate(modelview, [entity.position.x, 0, entity.position.y]); 

			if(name === "zombie") {
				mat4.rotateZ(modelview, Math.sin(entity.id.asNumber() * 127 + Date.now() / 1000) / 10  );
			}

			gl.uniformMatrix4fv(uProjection, false, projection); 
			gl.uniformMatrix4fv(uModelView, false, modelview); 

			if(uIdColor) {
				gl.uniform3fv(uIdColor, entity.id.asColor()); 
			}

			if(uHighlight) {
				if(pickedId === entity.id.asNumber()) { 
					gl.uniform1i(uHighlight, 1);  
				}
				else {
					gl.uniform1i(uHighlight, 0);  
				}
			}

			gl.drawArrays(gl.TRIANGLES, 0, gameobject.numVertices);
		}
	}
}

function drawWeapon() {
	gl.useProgram(colorprogram); 	

	var uModelView  = gl.getUniformLocation(colorprogram, "uModelview") 
	var uProjection = gl.getUniformLocation(colorprogram, "uProjection");
	var uTexture    = gl.getUniformLocation(colorprogram, "uTexture"); 
	var uHighlight  = gl.getUniformLocation(colorprogram, "uHighlight"); 

	var gameobject = weapon; 

	gl.bindBuffer(gl.ARRAY_BUFFER, gameobject.buffer); 
	gl.bindTexture(gl.TEXTURE_2D, gameobject.texture);
	
	gl.uniform1i(uTexture, 0); 
	gl.uniform1i(uHighlight, 0); 

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

	var modelview = mat4.identity(); 
	//mat4.multiply(modelview, camera); 
	mat4.translate(modelview, [0.7,-1.4,-0.7]); 
	mat4.rotateY(modelview, Math.PI / 2);

	gl.uniformMatrix4fv(uProjection, false, projection); 
	gl.uniformMatrix4fv(uModelView, false, modelview); 

	gl.drawArrays(gl.TRIANGLES, 0, gameobject.numVertices);
}

/////////////
}());
}()); 
