/**
 * Project Brief:
 * This is a direct port of the same code I wrote for Unity (which was much cleaner and more organized).
 * This is mostly for fun and to mess with the limits of browser rendering (though we aren't getting anywhere NEAR the limits!)
 * It's a pretty cool resume filler project I think.
 * 
 * Basically, we render an infinte (chunk-based, like many procedural games) museum and fill it with images from the
 * art gallery, which has a free API for the general public to use. Very cool!
 * 
 * Originally, I was going to implement the Harvard Art Gallery API, or another. But after thinking on it, I realized that
 * this project could have more value if it instead got art that people like us create. So instead, it swipes art from Reddit
 * (SFW content only) created by anyone in the world, with zero bias on vote count. Isn't that incredible?
 */

const clearOverlay = function() {
    if (document.getElementById("click-warning-overlay")) {
        document.body.removeChild(document.getElementById("click-warning-overlay"));
    }
}

import * as THREE from "https://cdn.skypack.dev/pin/three@v0.143.0-Cpkbmg37IsbIniRRPFSZ/mode=imports,min/optimized/three.js"
import { FontLoader } from "/FontLoader.js"
import { TextGeometry } from "/TextGeometry.js"
import TouchControls from "/TouchControls/TouchControls-master/js/TouchControls.js"
let touchControls;

// find out if a device is mobile (no keyboard or mouse)
function isMobile() {
    if (navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)) {
        clearOverlay();
        console.log("Detected Mobile Device, rerouting to original version...");
        window.location.href = "https://gallery.nowaythis.works/mobile.html";

        // on fail, attempt mobile controls with new setup
        return true;
    } else {
        // find elements tagged movement-pad and hide them
        return false;
    }
}

const mobile = isMobile();

/**
 * Engine and Player Setup
 */
const groundHeight = 0;
const ceilingHeight = 7;
const playerHeight = 2;
const playerSpeed = 6;
const playerSpeedSprintMod = 0.5;
const artwallSpawnDistance = 30;

/**
 * Basic THREE.JS Scene Setup
 * This will set up our world and camera tools
 */
// Internal
const scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xe5e8ea, 0.05);
scene.background = new THREE.Color(0xe5e8ea);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xe5e8ea, 1);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Textures and Materials
// carpet texture
const carpetTexture = new THREE.TextureLoader().load('img/carpet.png', function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
});

const ceilingTexture = new THREE.TextureLoader().load('img/ceiling.png', function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3.5, 3.5);
});

const wallTexture = new THREE.TextureLoader().load('img/ceiling.png', function (texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 2.5);
});

// Camera Starting Position
camera.position.set(0, playerHeight, 0);

// touch screen controls
function addControls() {
    // Controls
    let options = {
        delta: 0.75,           // coefficient of movement
        moveSpeed: 0.15,        // speed of movement
        rotationSpeed: 0.002,  // coefficient of rotation
        maxPitch: 55,          // max camera pitch angle
        hitTest: true,         // stop on hitting objects
        hitTestDistance: 40    // distance to test for hit
    }

    console.log("EL: " + renderer.domElement);
    touchControls = new TouchControls(document.body, camera, options)
    touchControls.setPosition(0, 25, 400)
    touchControls.addToScene(scene)
}
if (mobile) addControls();

// child cube for the camera, will be directly in front of it at all times
const followCube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0 }));
followCube.position.set(0, 0, -artwallSpawnDistance);
camera.add(followCube);
scene.add(camera);

/**
 * Fonts
 */
const fontLoader = new FontLoader();

const backgroundCube = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
backgroundCube.position.set(0, 0.5, -5.5);
scene.add(backgroundCube);

if (mobile) document.querySelector("#removal").style.textAlign = "center";

var loadingText;
var font;
fontLoader.load('fonts/Montserrat SemiBold_Regular.json', function (montserrat) {
    font = montserrat;
    
    loadingText = new TextGeometry('Loading...', {
        font: font,
        size: 0.45,
        height: 1,
        curveSegments: 2
    });

    const headerGeometry = new TextGeometry('The Infinite Gallery', {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 2
    });

    const header = new THREE.Mesh(headerGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(header);
    header.position.set(-6, 4, -5);
    header.scale.set(header.scale.x / 100, header.scale.y / 100, header.scale.z / 500);
    if (mobile) {
        header.scale.set(header.scale.x / 3, header.scale.y / 3, header.scale.z);
        header.position.set(-1.85, 4, -5);
    }

    var visitorText = 'This is an infinitem procedurally-generated 3D art gallery. Every piece of art is pulled from Reddit\'s r/Art.\nMeaning, everything in this gallery was created by a person like you or me!  Plus, there is no bias on the\namount of votes a post got, so absolutely anyone\'s art could appear here, regardless of fame.\nCurrently, there are over 1.8 MILLION pieces of art in this room. Just start walking and the exhibit\nwill appear around you.\n\nThanks for visiting!';
    if (mobile) {
        visitorText = 'This is an infinite 3D art gallery. Every piece of art is pulled from\nReddit\'s r/Art. Meaning, everything in this gallery was created by a\nperson like you or me!  Plus, there is no bias on the amount of votes\na post got, so absolutely anyone\'s art could appear here, regardless of fame.\nCurrently, there are over 1.8 MILLION pieces of art in this room.\nJust start walking and the exhibit will appear around you.\n\nThanks for visiting!';
        visitorText += '\n[Mobile Beta Version] Some features are only accessible on\na device with a keyboard and mouse.';
    }
    const subheaderGeometry = new TextGeometry(visitorText, {
        font: font,
        size: 15,
        height: 5,
        curveSegments: 2
    });
    const subheader = new THREE.Mesh(subheaderGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(subheader);
    subheader.position.set(-6, 3.5, -5);
    subheader.scale.set(subheader.scale.x / 100, subheader.scale.y / 100, subheader.scale.z / 500);
    if (mobile) {
        subheader.scale.set(subheader.scale.x / 2, subheader.scale.y / 2, subheader.scale.z);
        subheader.position.set(-1.85, 3.7, -5);
    }

    var tutorialText = 'Use Arrow Keys or [WASD] to walk. Use your mouse to look around.\nExplore and have fun!';
    if (mobile) {
        tutorialText = 'Drag your finger forwards on the circle to progress.\n(Access this page on a laptop or desktop PC for the full experience!)'
    }
    const tutorialGeometry = new TextGeometry(tutorialText, {
        font: font,
        size: 20,
        height: 5,
        curveSegments: 2
    });
    const tutorial = new THREE.Mesh(tutorialGeometry, new THREE.MeshBasicMaterial({ color: 0x711ca6 }));
    scene.add(tutorial);
    tutorial.position.set(-6, 1.1, -5);
    tutorial.scale.set(tutorial.scale.x / 100, tutorial.scale.y / 100, tutorial.scale.z / 500);
    if (mobile) {
        tutorial.scale.set(tutorial.scale.x / 3, tutorial.scale.y / 3, tutorial.scale.z);
        tutorial.position.set(-1.85, 2.1, -5);
    }
});

/**
 * First Person Controls
 * Mouse Look and Keyboard (WASD and Arrow Keys) Movement
 */

// MOUSE LOOK

var pointerIsLocked = false;
const canvas = document.body;
canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;

canvas.onclick = function () {
    if (mobile) return;
    canvas.requestPointerLock();
}

var mouseNegative = 1;
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
canvas.onmousemove = function (event) {
    if (pointerIsLocked) {
        const mouseX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const mouseY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        euler.y -= mouseX * 0.002;
        euler.x -= mouseY * 0.002 * mouseNegative;
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

        camera.quaternion.setFromEuler(euler);
    }
}

if ("onpointerlockchange" in document) {
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
} else if ("onmozpointerlockchange" in document) {
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
} else if ("onwebkitpointerlockchange" in document) {
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
}

function lockChangeAlert() {
    if (mobile) return;
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas) {
        pointerIsLocked = true;
    } else {
        pointerIsLocked = false;
    }
}

// WASD MOVEMENT
const keys = {};
document.addEventListener('keydown', function (event) {
    keys[event.code] = true;
}), document.addEventListener('keyup', function (event) {
    keys[event.code] = false;
});

/**
 * USER INTERFACE AND EVENT LISTENERS
 * Control the game UI's state and respond to user input
 */

// crosshair color

/**
 * RENDERING AND OBJECT UPDATING
 * Render the scene's elements and update the states of objects
 */

const chunkPositions = []; // separate list for faster sorting
const chunkPieces = [];
const chunkSize = 20;

const renderDistance = 8;

// check (cannot use includes due to exess data in each Vector2 object)
function hasChunk(pos) {
    for (let x = 0; x < chunkPositions.length; x++) {
        if (chunkPositions[x].x == pos.x && chunkPositions[x].y == pos.y) {
            return true;
        }
    }
    return false;
}

// Round to nearest chunksize
function RoundToChunkSize(num) {
    return Math.round(num / chunkSize) * chunkSize;
}

var readyToGenerate = true;
function startGenerateCountdown() {
    readyToGenerate = false;
    setTimeout(function () {
        readyToGenerate = true;
    }, 0.5 * 1000);
}

// lerp the transparency 0 to 1
const artboardMaterials = [];

// format is Y X Z
var isSprinting = false;
const moveVector = new THREE.Vector3();
function update(delta) {
    // COVER-UPS
    scene.attach(followCube);
    followCube.position.y = 0;
    camera.attach(followCube);

    // WORLD GENERATION
    for (let x = -renderDistance / 2; x < renderDistance / 2; x++) {
        for (let y = -renderDistance / 2; y < renderDistance / 2; y++) {
            const playerRelativeLocation = new THREE.Vector2(RoundToChunkSize(camera.position.x), RoundToChunkSize(camera.position.z));
            let newLocation = new THREE.Vector2(x * chunkSize, y * chunkSize);

            newLocation = newLocation.add(playerRelativeLocation);

            if (!hasChunk(newLocation)) {
                if (newLocation.distanceTo(new THREE.Vector2(camera.position.x, camera.position.z)) < (renderDistance * chunkSize / 2)) {
                    generateChunk(newLocation);
                }
            }
        }
    }

    // Lerp Artboard Materials
    for (let i = 0; i < artboardMaterials.length; i++) {
        if (artboardMaterials[i].opacity < 1) {
            artboardMaterials[i].opacity += 0.5 * delta;
        }
    }

    // cleanup
    for (let i = 0; i < chunkPieces.length; i++) {
        if (chunkPieces[i].position.distanceTo(camera.position) > (renderDistance * (chunkSize / 2))) {
            scene.remove(chunkPieces[i]);
            chunkPieces[i].geometry.dispose();
            chunkPieces[i].material.dispose();
            chunkPositions.splice(chunkPositions.indexOf(chunkPieces[i].position), 1);
            chunkPieces.splice(chunkPieces.indexOf(chunkPieces[i]), 1);
        }
    }

    // CONTROLS
    if (mobile) touchControls.update();

    if (mobile == false) {
        var movementPad = document.querySelector(".movement-pad");
        // remove the element
        if (movementPad != undefined) movementPad.parentNode.removeChild(movementPad);
    }

    const moveSpeed = playerSpeed * delta * (1 + Number(isSprinting) * playerSpeedSprintMod);

    if (keys['KeyW'] || keys['ArrowUp'] || (mobile && touchControls.moveForward)) {
        if (mobile && touchControls.moveBackward) {
            camera.position.z -= moveSpeed;
        } else {
            // forward movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.crossVectors(camera.up, moveVector);
            moveVector.multiplyScalar(moveSpeed);

            camera.position.addScaledVector(moveVector, 1);
        }
    }
    if (keys['KeyS'] || keys['ArrowDown'] || (mobile && touchControls.moveBackward)) {
        if (mobile && touchControls.moveBackward) {
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.crossVectors(camera.up, moveVector);
            moveVector.multiplyScalar(moveSpeed);

            camera.position.addScaledVector(moveVector, -1);
        }
        else {
            // backward movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.crossVectors(camera.up, moveVector);
            moveVector.multiplyScalar(moveSpeed);

            camera.position.addScaledVector(moveVector, -1);
        }
    }
    if (keys['KeyA'] || keys['ArrowLeft'] || (mobile && touchControls.moveLeft)) {
        if (mobile && touchControls.moveLeft) {
            camera.position.x += moveSpeed;
        }
        else {
            // left movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.multiplyScalar(moveSpeed);
            camera.position.addScaledVector(moveVector, -1);
        }

    }
    if (keys['KeyD'] || keys['ArrowRight'] || (mobile && touchControls.moveRight)) {
        if (mobile && touchControls.moveRight) {
            camera.position.x -= moveSpeed;
        }
        else {
            // right movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.multiplyScalar(moveSpeed);
            camera.position.addScaledVector(moveVector, 1);
        }
    }

    isSprinting = keys['ShiftLeft'] || keys['ShiftRight'] || false;

    // update coords display
    document.querySelector("#coords").innerHTML = camera.position.x.toFixed(0) + ", " + camera.position.y.toFixed(0) + ", " + camera.position.z.toFixed(0);
}

// to prevent dupes
const artImages = [];
function generateChunk(pos) {
    // add to global chunks list
    chunkPositions.push(pos);

    // generate rand seeded on chunk position
    const posString = pos.x + "" + pos.y + "" + pos.z;
    const rand = Math.floor(new Math.seedrandom(posString).quick() * 100);

    // chunk mesh
    const chunk = new THREE.Mesh(
        new THREE.PlaneGeometry(chunkSize, chunkSize, 1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: carpetTexture
        })
    );
    chunk.rotation.x = -Math.PI / 2;
    chunk.position.set(pos.x, groundHeight, pos.y);
    scene.add(chunk);
    chunkPieces.push(chunk);

    // chunk ceiling
    const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(chunkSize, chunkSize, 1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: ceilingTexture
        })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(pos.x, ceilingHeight, pos.y);
    scene.add(ceiling);
    chunkPieces.push(ceiling);

    // min distance for walls is 15 away from spawn
    if (pos.distanceTo(new THREE.Vector2(0, 0)) > 15) {
        // check for dupes
        for (let i = 0; i < chunkPieces.length; i++) {
            if (chunkPieces[i].name == "wall") {
                if (chunkPieces[i].position.equals(new THREE.Vector3(pos.x, 3.5, pos.y))) {
                    return;
                }
            }
        }

        const wallBaseMesh = new THREE.Mesh(new THREE.BoxGeometry(chunkSize, chunkSize, 0.2), new THREE.MeshBasicMaterial({ color: 0xe8e6e6 }));
        wallBaseMesh.position.set(pos.x, 3.5, pos.y);
        wallBaseMesh.name = "wall";

        const wallArtMesh = new THREE.Mesh(new THREE.BoxGeometry(chunkSize / 4, chunkSize / 4, 0.4), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 }));
        wallArtMesh.position.set(pos.x + 0.01, 3.5, pos.y + 0.01);
        wallArtMesh.name = "art";

        let canGenerate = true;

        if (rand < 50) {
            wallBaseMesh.rotation.y = Math.PI / 2;
            wallArtMesh.rotation.y = Math.PI / 2;
        }
        scene.add(wallArtMesh);
        scene.add(wallBaseMesh);
        chunkPieces.push(wallBaseMesh);
        chunkPieces.push(wallArtMesh);
        
        for (let i = 0; i < chunkPieces.length; i++) {
            if (chunkPieces[i].name == "art" || chunkPieces[i].name == "plaque") {
                if (chunkPieces[i].position.equals(new THREE.Vector3(pos.x, 3.5, pos.y))) {
                    canGenerate = false;
                }
            }
        }

        // 10% wont have nothin, excusing the generator cooldown. this consistently adds nice spacing in between artworks.
        if (rand < 45) {
            if (!readyToGenerate) return;
            
            // first make a request to random-image-identify
            console.log("Making Request");
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "https://blog.nowaythis.works/random-image-identify");
            xhr.send();
            xhr.onload = function () {
                if (xhr.status == 200) {
                    startGenerateCountdown();
                    
                    const loadingTextMesh = new THREE.Mesh(
                        loadingText,
                        new THREE.MeshBasicMaterial({
                            color: 0x000000
                        })
                    );
                    scene.add(loadingTextMesh);
                    loadingTextMesh.scale.z /= 50;
                    loadingTextMesh.position.set(pos.x+0.1, 1, pos.y+0.1);
                    loadingTextMesh.rotation.y = Math.PI/2;
                    
                    const response = xhr.responseText.split('|||||');
                    let metadata = response[0];
                    // add a '\n' to metadata every 48 characters
                    let metadataFormatted = "";
                    for (let i = 0; i < metadata.length; i++) {
                        if (i % 48 == 0) {
                            metadataFormatted += "\n";
                        }
                        metadataFormatted += metadata[i];
                    }
                    metadata = metadataFormatted;
                    const urlToRequest = response[1];
                    console.log("Got Response");

                    const loader = new THREE.TextureLoader();
                    loader.setCrossOrigin("anonymous");

                    loader.load(
                        "https://blog.nowaythis.works/get-image-direct?url=" + urlToRequest,
                        function (art) {
                            // chance for chunk to spawn ART!!
                            for (let x = 0; x < artImages.length; x++) {
                                if (artImages[x] == art) {
                                    artImages.splice(artImages.indexOf(artImages[i].position), 1);
                                    canGenerate = false;
                                    console.log("Failed. Dupe Found.");
                                    scene.remove(wallArtMesh);
                                }
                            }

                            if (canGenerate) {
                                artImages.push(art);

                                wallArtMesh.geometry = new THREE.BoxGeometry(art.image.width / 600, art.image.height / 600, 0.01);
                                wallArtMesh.material = new THREE.MeshBasicMaterial({
                                    map: art,
                                    transparent: true,
                                    opacity: 0
                                });

                                artboardMaterials.push(wallArtMesh.material);
                                
                                // create a plaque with the metadata (which includes the author + title)
                                const plaqueMesh = new THREE.Mesh(
                                    new THREE.BoxGeometry(4.5, 1.25, 0.25),
                                    new THREE.MeshBasicMaterial({
                                        color: 0xb59e1b
                                    })
                                );
                                plaqueMesh.rotation.y = Math.PI / 2;
                                plaqueMesh.position.set(pos.x+0.25, 1, pos.y);
                                plaqueMesh.name = "plaque";
                                wallArtMesh.position.x += 0.25;
                                scene.add(plaqueMesh);
    
                                // plaque text
                                const plaqueTextMesh = new THREE.Mesh(
                                    new TextGeometry(metadata, {
                                        font: font,
                                        size: 0.1,
                                        height: 0.13
                                    }),
                                    new THREE.MeshBasicMaterial({
                                        color: 0x000000
                                    })
                                );
                                plaqueTextMesh.position.x -= 2;
                                plaqueTextMesh.position.y += 0.3;
                                plaqueMesh.add(plaqueTextMesh);
                            }
                            scene.remove(loadingTextMesh);
                        }
                    );
                }
            }
        }

        return true;
    }
}

// generateChunk(new THREE.Vector2(0, 0));

const time = new THREE.Clock();


function render() {
    requestAnimationFrame(render);
    const delta = time.getDelta();

    update(delta);
    renderer.render(scene, camera);
}

render();

// window rescaling fix
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// on press of V key
document.addEventListener('keydown', function (event) {
    if (event.code === 'KeyV') {
        mouseNegative = -1 * mouseNegative;
    }
});

// on press of E key, move the camera UP 1 unit. on press of Q key, move the camera DOWN 1 unit.
document.addEventListener('keydown', function (event) {
    if (event.code === 'KeyE') {
        camera.position.y += 1;
    }
    if (event.code === 'KeyQ') {
        camera.position.y -= 1;
    }
});

// on body click, delete element "click-warning-overlay" if it exists
document.body.addEventListener('click', function (event) {
    clearOverlay();
});