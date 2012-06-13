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
	var idprogram = null; 
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
			processLevel(mapdata, callbackprogress, callbackfinished);  
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

				mainprogram = GLT.SHADER.compileProgram( gl, files[mapdata.programname].data );
				idprogram   = GLT.SHADER.compileProgram( gl, files[mapdata.idprogramname].data );
				aVertex     = gl.getAttribLocation(mainprogram, "aVertex"); 
				aTextureuv  = gl.getAttribLocation(mainprogram, "aTextureuv"); 
				aNormal     = gl.getAttribLocation(mainprogram, "aNormal"); 


				var gameobjects = Object.create(null);
				for(var i = 0; i != mapdata.objects.models.length; i++) {
					var entity = mapdata.objects.models[i]; 
					var name = entity.name; 
					var objdata = files[entity.model].data;
					var texture = files[entity.texture].data; 

					var go = createPropperGameObject({
						"name"    : entity.name, 
						"objdata" : objdata,  
						"texture" : texture,
						"nearest" : !!files[entity.texture].filter
					}); 

					gameobjects[go.name] = go; 
				}

				var map = getMapStructure(mapdata, gameobjects); 
				var weapon = createPropperGameObject({
					"name"    : "weapon", 
					"objdata" : files[mapdata.weaponmodel].data,  
					"texture" : files[mapdata.weapontexture].data
				});

				onfinished({
					"gameobjects" : gameobjects, 
					"grid"        : map.grid, 
					"startpoint"  : map.startpoint,
					"program"     : mainprogram,
					"weapon"      : weapon, 
					"idprogram"   : idprogram
				});
			}
		});
	}

	function getMapStructure(mapdata, gameobjects) {
		var grid = [[]]; 
		var startpoint; 

		for(var y = 0; y != mapdata.height; y++) {
			grid[y] = []; 

			for(var x = 0; x != mapdata.width; x++) {
				var c = mapdata.objectmap[y][x]; 

				if(c === " ") {
					continue; 
				}
				else if(mapdata.mapping[c]) {
					grid[y][x] = mapdata.mapping[c]; 
				}
				else if(c === "s") { 
					startpoint = { "x" : x, "y" : y }; 
				}
				else {
					grid[y][x] = null;  
				}
			}
		}

		return {
			"grid" : grid, 
			"startpoint" : startpoint
		};
	}

	function createPropperGameObject(info) {
		var vtnBuffer = gl.createBuffer(); 
		gl.bindBuffer(gl.ARRAY_BUFFER, vtnBuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, info.objdata.rawData, gl.STATIC_DRAW);

		var texture = gl.createTexture(); 
		gl.bindTexture(gl.TEXTURE_2D, texture); 
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, info.texture); 

		var filter = info.nearest ? gl.NEAREST : gl.LINEAR; 

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); 
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); 
		gl.bindTexture(gl.TEXTURE_2D, null); 



		return {
			"name"        : info.name,
			"schema"      : info.objdata.schema, 
			"numVertices" : info.objdata.numVertices,  
			"voffset"     : info.objdata.voffset, 
			"toffset"     : info.objdata.toffset, 
			"noffset"     : info.objdata.noffset, 
			"stride"      : info.objdata.stride, 
			"buffer"      : vtnBuffer, 
			"aVertex"     : aVertex, 
			"aTextureuv"  : aTextureuv, 
			"aNormal"     : aNormal, 
			"texture"     : texture
		};
	}

	function mapNameToKey(data) {
		var dict = Object.create(null);
		var d; 
		for(var k in data) {
			d = data[k]; 
			if(d.name) {
				dict[d.name] = d;
			}
		}
		return dict; 
	}
}

}()); 
}
var GAME_LEVELMANAGER_JS = true; 


















