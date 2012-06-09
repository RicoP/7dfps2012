//= lib/glt.js
//= game.js
//= game.pathhelper.js 

if(!GAME_LEVELMANAGER_JS) {
(function() { 
"use strict"; 

GAME.LEVELMANAGER = {}; 

GAME.LEVELMANAGER.loadlevel = function(name, gl, callbackprogress, callbackfinished) {
	var mappath = "maps/" + name + ".json"; 

	GLT.loadmanager.loadFiles({
		"files" : [ mappath ], 
		"error" : function (file, m) {
			console.error(file, m); 
		}, 
		"finished" : function(files) {
			var mapdata = files[mappath]; 
			processLevel(mapdata, callbackprogress, callbackfinished);  
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
				//TODO move the dataloading to the update event 
				console.log("loaded"); 
				var dict = mapTagToKey(data, gl); 				
				var gameobjects = [];
				for(var i = 0; i != map.objects.models.length; i++) {
					var entity = map.objects.models[i]; 
					var name = entity.name; 
					var objdata = dict[entity.model];
					var texture = dict[entity.texture]; 
					var shader  = dict[entity.shader]; 

					gameobjects.push( createPropperGameObject({
						"name"    : entity.name, 
						"objdata" : dict[entity.model],
						"texture" : dict[entity.texture], 
						"shader"  : dict[entity.shader]  
					}));
				}
			}
		});
	}

	function createPropperGameObject(info) {
		var vtnBuffer = gl.createBuffer(); 
		gl.bindBuffer(gl.ARRAY_BUFFER, vtnBuffer); 
		gl.bufferData(gl.ARRAY_BUFFER, info.objdata.rawData, gl.STATIC_DRAW);
		//TODO 
	}

	function mapTagToKey(data) {
		var dict = {};
		var d; 
		for(var k in data) {
			d = data[k]; 
			if(d.tag) {
				if(d.type === "shader") { 
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







