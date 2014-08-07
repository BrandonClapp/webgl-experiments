var global = {};
 

// setups normal camera
var setupNormalCamera = function() {
	// This creates and positions the arc camera
	global.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, Math.PI/2, 10, new BABYLON.Vector3(0, 0, 0), global.scene);

	// limiting the upper and lower bounds removes the scrollwheel behaviour
	global.camera.lowerRadiusLimit = global.camera.radius;
	global.camera.upperRadiusLimit = global.camera.radius;

	// This attaches the camera to the canvas
	global.camera.attachControl(global.canvas, false);
}

// setup photosphere
var setupPhotoSphere = function(){
	
	// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
	var sphere = BABYLON.Mesh.CreateSphere("sphere1", 32, 100, global.scene);

	// load material
	var texture = new BABYLON.Texture("picture.jpg", global.scene);
	
	// rotate texture
	texture.wAng = Math.PI/-2;
	
	// create new material
	var materialPhotoSphere = new BABYLON.StandardMaterial("texturePhotoSphere", global.scene);
	materialPhotoSphere.diffuseTexture = texture;
	
	// enable backface culling
	materialPhotoSphere.backFaceCulling = false;
	//sphere.scaling.x = -1;
	
	// set emissive color
	materialPhotoSphere.emissiveColor = new BABYLON.Color3(1.0, 1.0, 1.0);

	// asign material to sphere
	sphere.material = materialPhotoSphere;
	
	

}

// Init babylon
var setupBabylon = function() {

	// Get the canvas element from our HTML below
	global.canvas = document.getElementById("renderCanvas");

	// Load BABYLON 3D engine
	global.engine = new BABYLON.Engine(global.canvas, true);

	 // This creates a basic Babylon Scene object (non-mesh)
	global.scene = new BABYLON.Scene(global.engine);

	// setup camera
	setupNormalCamera()

	// setup photosphere
	setupPhotoSphere();
	
	// Once the scene is loaded, just register a render loop to render it
	global.engine.runRenderLoop(function () {
		global.scene.render();
	});
	
}

// onload
$(document).ready(function() {
	
	//setup babylonjs
	setupBabylon();
});



