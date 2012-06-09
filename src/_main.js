(function() { 
"use strict"; 

var gl = GLT.createContext(document.getElementsByTagName("canvas")[0]); 
var program = null; 
var texture = null; 
var modelname = "ak47bake.obj"; 
var texturename = "ak47bakedtexture.png";

var projection = mat4.perspective(75, 4/3, 0.1, 1000); 
var modelview = mat4.identity(); 
var entity = null; 
var cameraPos = vec3.create([0, 0, 0]); 
var cameraDir = vec3.create([0,0,0]); 
var cameraNormal = vec3.create([0,0,-1]); 
var cameraUp = vec3.create([0,1,0]); 
var camera = mat4.lookAt(cameraPos, vec3.add(cameraPos, cameraNormal, cameraDir), cameraUp); 

GLT.loadmanager.loadFiles({
	"files" : [
		modelname, 
		texturename, 
		"shader.vs", 
		"shader.fs"
	], 
	"update" : (function() {
		var bar = document.getElementById("progressbar"); 
		var fallback = document.getElementById("progressbar-fallback"); 

		return function(file, progress) {
			bar.value = 100*progress; 
			fallback.innerHTML = ~~(100*progress);
		};
	}()),
	"finished" : function(files) {
		setup(files); 
		GLT.requestGameFrame(draw); 
	},	
	"error" : function(file, message) {
		console.log(file, message); 
	}
});

function setup(files) {
	entity = files[modelname]; 

	gl.enable( gl.DEPTH_TEST ); 
	gl.enable( gl.CULL_FACE ); 
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER); 
	gl.shaderSource(vertexShader, files["shader.vs"]);
	gl.compileShader(vertexShader); 
	console.log( gl.getShaderInfoLog(vertexShader) ); 

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); 
	gl.shaderSource(fragmentShader, files["shader.fs"]);
	gl.compileShader(fragmentShader); 
	console.log( gl.getShaderInfoLog(fragmentShader) ); 

	program = gl.createProgram(); 

	gl.attachShader(program, vertexShader); 
	gl.attachShader(program, fragmentShader); 
	gl.linkProgram(program); 

	console.log( gl.getProgramInfoLog(program) ); 

	var vtnBuffer = gl.createBuffer(); 
	gl.bindBuffer(gl.ARRAY_BUFFER, vtnBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, entity.rawData, gl.STATIC_DRAW); 
	
	//attribute vec4 vPosition;
	gl.vertexAttribPointer(0, 4, gl.FLOAT, false, entity.stride, entity.voffset);
	gl.enableVertexAttribArray(0); 

	if(entity.schema & GLT.obj.SCHEMA_VT) { 
		//attribute vec2 vTextureCoord;
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, entity.stride, entity.toffset);
		gl.enableVertexAttribArray(1); 
	}

	if(entity.schema & GLT.obj.SCHEMA_VN) { 
		//attribute vec4 vNormal;
		gl.vertexAttribPointer(2, 4, gl.FLOAT, false, entity.stride, entity.noffset);
		gl.enableVertexAttribArray(2); 
	}

	gl.useProgram(program); 

	var img = files[texturename]; 
	
	texture = gl.createTexture(); 
	gl.bindTexture(gl.TEXTURE_2D, texture); 
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

function draw(time) {
	var moved = false; 

	gl.clearColor(0,0,0,1); 
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
	mat4.multiply(modelview, camera); 
	//mat4.translate(modelview, [0, 0, -3]); 
	mat4.rotateX(modelview, Date.now() / 1000);
	mat4.rotateZ(modelview, Date.now() / 1500);
	//mat4.scale(modelview, [0.05, 0.05, 0.05]); 

	gl.bindTexture(gl.TEXTURE_2D, texture); 
	gl.uniform1i(indxTexture, 0); 

	gl.uniformMatrix4fv(indxProjection, false, projection); 
	gl.uniformMatrix4fv(indxModelView, false, modelview); 

	gl.drawArrays(gl.TRIANGLES, 0, entity.numVertices); 

	GLT.requestGameFrame(draw); 
}
}()); 

