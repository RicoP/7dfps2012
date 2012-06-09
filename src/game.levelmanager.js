//= lib/glt.js
//= game.js
//= game.pathhelper.js 

if(!GAME_LEVELMANAGER_JS) {
(function() { 
"use strict"; 

GAME.LEVELMANAGER = {}; 

GAME.LEVELMANAGER.loadlevel = function(name, gl, callbackprogress, callbackfinished) {
	var mapfilepath = "maps/" + name + ".json"; 
	var mainprogram = null; 
	var aVertex = -1; 
	var aTextureuv = -1; 
	var aNormal = -1; 

	GLT.loadmanager.loadFiles({
		"files" : [ mapfilepath ], 
		"error" : function (file, m) {
			console.error(file, m); 
		}, 
		"finished" : function(files) {
			var mapdata = files[mapfilepath]; 
			processLevel(mapdata, callbackprogress, function(mapdata) {
				//TODO 
			});  
		}
	}); 

	function processLevel(mapdata, onupdate, onfinished) {
		GLT.loadmanager.loadFiles({
			"files" : mapdata.files, 
			"update" : onupdate, 
			"error" : function (file, m) {
				console.error(file, m); 
			}, 
			"finished" : function(filesWithNames) {
				var files = mapNameToKey(filesWithNames, gl); 				

				mainprogram = GLT.SHADER.compileProgram( gl, files[mapdata.programname] );
				aVertex     = gl.getAttribLocation(mainprogram, "aVertex"); 
				aTextureuv  = gl.getAttribLocation(mainprogram, "aTextureuv"); 
				aNormal     = gl.getAttribLocation(mainprogram, "aNormal"); 

				var gameobjects = [];
				for(var i = 0; i != mapdata.objects.models.length; i++) {
					var entity = mapdata.objects.models[i]; 
					var name = entity.name; 
					var objdata = files[entity.model];
					var texture = files[entity.texture]; 
					var program = files[entity.program]; 

					gameobjects.push( createPropperGameObject({
						"name"    : entity.name, 
						"objdata" : files[entity.model],
						"texture" : files[entity.texture], 
						"program" : files[entity.program]  
					}));
				}

				var grid = getGrid(mapdata); 
			}
		});
	}

	function getGrid(mapdata) {
		
	}

	function createPropperGameObject(info) {
		var vtnBuffer = gl.createBuffer(); 
		gl.bindBuffer(gl.ARRAY_BUFFER, vtnBuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, info.objdata.rawData, gl.STATIC_DRAW);

		var texture = gl.createTexture(); 
		gl.bindTexture(gl.TEXTURE_2D, texture); 
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, info.texture); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 
		gl.bindTexture(gl.TEXTURE_2D, null); 

		return {
			"name"       : info.name,
			"schema"     : info.objdata.schema, 
			"buffer"     : vtnBuffer, 
			"aVertex"    : aVertex, 
			"aTextureuv" : aTextureuv, 
			"aNormal"    : aNormal, 
			"texture"    : texture
		};
	}

	function mapNameToKey(data) {
		var dict = {};
		var d; 
		for(var k in data) {
			d = data[k]; 
			if(d.name) {
				dict[d.name] = d.data;
			}
		}
		return dict; 
	}
}

}()); 
}
var GAME_LEVELMANAGER_JS = true; 


















