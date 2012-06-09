//= lib/glt.js
//= game.js
//= game.pathhelper.js 

if(!GAME_LEVELMANAGER_JS) {
(function() { 
"use strict"; 

GAME.LEVELMANAGER = {}; 

GAME.LEVELMANAGER.loadlevel = function(name, gl, callbackprogress, callbackfinished) {
	var mappath = "maps/" + name + ".json"; 
	var mainprogram = null; 
	var aVertex = -1; 
	var aTextureuv = -1; 
	var aNormal = -1; 

	GLT.loadmanager.loadFiles({
		"files" : [ mappath ], 
		"error" : function (file, m) {
			console.error(file, m); 
		}, 
		"finished" : function(files) {
			var mapdata = files[mappath]; 
			processLevel(mapdata, callbackprogress, function(mapdata) {
				//TODO 
			});  
		}
	}); 

	function processLevel(map, onupdate, onfinished) {
		GLT.loadmanager.loadFiles({
			"files" : map.data, 
			"update" : onupdate, 
			"error" : function (file, m) {
				console.error(file, m); 
			}, 
			"finished" : function(data) {
				console.log("loaded"); 
				var dict = mapTagToKey(data, gl); 				

				mainprogram = dict[map.programname];
				aVertex     = gl.getAttribLocation(mainprogram, "aVertex"); 
				aTextureuv  = gl.getAttribLocation(mainprogram, "aTextureuv"); 
				aNormal     = gl.getAttribLocation(mainprogram, "aNormal"); 

				var gameobjects = [];
				for(var i = 0; i != map.objects.models.length; i++) {
					var entity = map.objects.models[i]; 
					var name = entity.name; 
					var objdata = dict[entity.model];
					var texture = dict[entity.texture]; 
					var program = dict[entity.program]; 

					gameobjects.push( createPropperGameObject({
						"name"    : entity.name, 
						"objdata" : dict[entity.model],
						"texture" : dict[entity.texture], 
						"program" : dict[entity.program]  
					}));
				}

				var grid = [[]]; 

			}
		});
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
			"name" : info.name,
			"schema" : info.objdata.schema, 
			"buffer" : vtnBuffer, 
			"aVertex" : aVertex, 
			"aTextureuv" : aTextureuv, 
			"aNormal" : aNormal, 
			"texture" : texture
		};
	}

	function mapTagToKey(data) {
		var dict = {};
		var d; 
		for(var k in data) {
			d = data[k]; 
			if(d.tag) {
				if(d.type === "program") { 
					dict[d.tag] = GLT.SHADER.compileProgram(gl, d.data); 
				}
				else { 
					dict[d.tag] = d.data;
				}
			}
		}
		return dict; 
	}
}

}()); 
}
var GAME_LEVELMANAGER_JS = true; 


















