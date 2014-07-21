var global = {};

// load video and build plane
var loadVideoAndBuildVideoPlane = function() {
     
    var video_plane = new BABYLON.Mesh.CreatePlane("video_plane",5,global.scene);
    
    // set position
    video_plane.position.y = 2.4;
    video_plane.position.x = 0;
    video_plane.position.z = -6.43;
    
    // set rotation
    video_plane.rotation.x = Math.PI;
    video_plane.rotation.z = Math.PI;
    
    // set scale
    video_plane.scaling.y = 0.7;
    video_plane.scaling.x = 1.5;
    
    // load material
    video_plane.material = new BABYLON.StandardMaterial("video_plane_mat", global.scene);
    video_plane.material.emissiveColor = new BABYLON.Color3(1,1,1);
    video_plane.material.backFaceCulling = 1;
    video_plane.material.diffuseTexture = new BABYLON.VideoTexture("vid", ["bigbuckbunny.mp4"], 512, global.scene, false);
    
    // store a link to the diffuse texture
    global.video_player = video_plane.material.diffuseTexture.video;
    
    global.scene.lights[0].intensity = 0.2;                    

    // set is playing flag to true
    global.video_playing = true;
}


// setup oculus rift
var setupOculus = function() {
    var originCamera = global.scene.activeCamera;
    global.scene.activeCamera = new BABYLON.OculusCamera("Oculus", originCamera.position, global.scene);
    global.scene.activeCamera.minZ = originCamera.minZ;
    global.scene.activeCamera.maxZ = originCamera.maxZ;
    global.scene.activeCamera.gravity = originCamera.gravity;
    global.scene.activeCamera.checkCollisions = false;
    global.scene.activeCamera.applyGravity = false;
    global.scene.activeCamera.attachControl(global.canvas);
    global.scene.activeCamera.speed = originCamera.speed;
    global.scene.activeCamera.rotation.copyFrom(originCamera.rotation);
}

// onload
$(document).ready(function() {
    
    // handle keypress
    $(document).keypress(function(e){
        
        console.log(e.keyCode);
        
        if (e.keyCode == 32) {
            
            // check if video player has intitialized
            if (global.video_player != undefined) {
                
                if (global.video_playing) {
                    
                    // pause video 
                    global.video_player.pause();
                    
                    // set flag
                    global.video_playing = false;

                    
                    // fade in light
                    var number = 0.5;
                    var interval = setInterval(function() {
                        if (number >= 1.2) {
                            clearInterval(interval);
                        }
                        number += 0.1;
                        global.scene.lights[0].intensity = number;
                    }, 50);
                                        
                }else {
                                        
                    // play video 
                    global.video_player.play();
                    
                    // set flag
                    global.video_playing = true;

                    // fade in light
                    var number = 1.2;
                    var interval = setInterval(function() {
                        if (number <= 0.5) {
                            clearInterval(interval);
                        }
                        number -= 0.1;
                        global.scene.lights[0].intensity = number;
                    }, 50);
                    
                    
                }
            }
            // end else keycode space
        } else if (e.keyCode == 114 ) {
            setupOculus();
        } // else keycode r
    });

    
    // Get the canvas element from our HTML below
    global.canvas = document.getElementById("renderCanvas");
    
    // store engine
    global.engine = new BABYLON.Engine(global.canvas, true);
    
    // shaders
    BABYLON.Engine.ShadersRepository = "/Babylon/Shaders/";

    
    // load classroomm scene
    BABYLON.SceneLoader.Load("", "classroom.babylon", global.engine , function (newScene) {
        
        // store scene
        global.scene = newScene;

        // Wait for textures and shaders to be ready
        global.scene.executeWhenReady(function () {
            
            // Attach camera to canvas input s 
            global.scene.activeCamera.attachControl(global.canvas);
            
            
            // load video
            loadVideoAndBuildVideoPlane();
            
            // Once the scene is loaded, just register a render loop to render it
            global.engine.runRenderLoop(function() {
                global.scene.render();
            });

        });
        
    }, function (progress) {
       
    });
});

