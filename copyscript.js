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

// NOTE: the print() command is very useful!!
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
scene.fog = new THREE.FogExp2(0xe5e8ea, 0.05);
scene.background = new THREE.Color(0xe5e8ea);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
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
addControls();

// child cube for the camera, will be directly in front of it at all times
const followCube = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0 }));
followCube.position.set(0, 0, -artwallSpawnDistance);
camera.add(followCube);
scene.add(camera);

/**
 * Fonts
 */
const fontLoader = new FontLoader();

const backgroundCube = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 1), new THREE.MeshBasicMaterial({color: 0x000000}));
backgroundCube.position.set(0, 0.5, -5.5);
scene.add(backgroundCube);

if (mobile) document.querySelector("#removal").style.textAlign = "center";

var loadingText;
fontLoader.load('fonts/Montserrat SemiBold_Regular.json', function (font) {
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

    var visitorText = 'This is an infinite 3D art gallery. Every piece of art is pulled from Reddit\'s r/Art. Meaning, everything in this gallery\nwas created by a person like you or me!  Plus, there is no bias on the amount of votes a post got,\nso absolutely anyone\'s art could appear here, regardless of fame. Currently, there are over 1.8 MILLION pieces\nof art in this room. Just start walking and the exhibit will appear around you.\n\nThanks for visiting!';
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

const renderDistance = 6;

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
    }, 5 * 1000);
}

// lerp the transparency 0 to 1
const artboardMaterials = [];
(function attemptArtboard() {
    setTimeout(function () {
        // ART GENERATION
        if (Math.floor(Math.random() * 1000) < 200 && readyToGenerate == true) {
            let canGenerate = true;
            startGenerateCountdown();

            const pos = new THREE.Vector3(0, 0, 0);
            followCube.getWorldPosition(pos);

            // make sure artwalls don't hop on the same spot, since they are separated from chunk meshes
            for (let i = 0; i < chunkPieces.length; i++) {
                if (chunkPieces[i].name == "artWall") {
                    let thisPos = new THREE.Vector2(pos.x, pos.z);
                    let thatPos = new THREE.Vector2(chunkPieces[i].position.x, chunkPieces[i].position.z);
                    if (thisPos.distanceTo(thatPos) < 3) {
                        canGenerate = false;
                    }
                }
            }

            if (canGenerate) {
                let artWall = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 0.1),
                    new THREE.MeshBasicMaterial({
                        color: 0xffffff
                    })
                );

                const loadingTextMesh = new THREE.Mesh(
                    loadingText,
                    new THREE.MeshBasicMaterial({
                        color: 0x000000
                    })
                );
                scene.add(loadingTextMesh);
                loadingTextMesh.scale.z /= 50;
                loadingTextMesh.position.set(pos.x, 1, pos.z);
                

                chunkPieces.push(artWall);
                artWall.name = "artWall";
                
                artWall.position.set(pos.x, groundHeight + 2, pos.z);
                scene.add(artWall);
                chunkPieces.push(artWall);

                if (Math.floor(Math.random() * 10) < 5 && mobile == false) {
                    artWall.rotation.y = -Math.PI / 2;
                    loadingTextMesh.rotation.y = -Math.PI / 2;
                    loadingTextMesh.position.z = pos.z - 1.4;
                }
                else
                {
                    loadingTextMesh.position.x = pos.x - 1.4;
                }

                const loader = new THREE.TextureLoader();
                loader.setCrossOrigin("anonymous");
                const rand = Math.floor(Math.random() * 1000000);
                loader.load(
                    "https://blog.nowaythis.works/random-image?dummy=" + rand,
                    function (art) {
                        // chance for chunk to spawn ART!!
                        for (let x = 0; x < artImages.length; x++) {
                            if (artImages[x] == art) {
                                scene.remove(artWall);
                                artImages.splice(artImages.indexOf(artImages[i].position), 1);
                                canGenerate = false;
                                scene.remove(artWall);
                            }
                        }

                        if (canGenerate) {
                            artImages.push(art);

                            artWall.geometry = new THREE.BoxGeometry(art.image.width / 700, art.image.height / 700, 0.02);
                            artWall.material = new THREE.MeshBasicMaterial({
                                map: art,
                                transparent: true,
                                opacity: 0
                            });

                            artboardMaterials.push(artWall.material);
                            scene.remove(loadingTextMesh);
                        }
                    }
                );

            }
        }
        attemptArtboard()
    }, 1 * 1000);
}());



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

    // this could easily be combined into one loop, but I'm too darn lazy to do that.
    // especially because it would require refactoring code i wrote earlier, and it's too early in the morning to do that.
    // so let's overcomplicate things: two loops that cycle floors and ceilings independently
    for (let i = 0; i < chunkPieces.length; i++) {
        if (chunkPieces[i].position.distanceTo(camera.position) > (renderDistance * (chunkSize / 2))) {
            scene.remove(chunkPieces[i]);
            chunkPositions.splice(chunkPositions.indexOf(chunkPieces[i].position), 1);
            chunkPieces.splice(chunkPieces.indexOf(chunkPieces[i]), 1);
        }
    }

    // CONTROLS
    touchControls.update();

    if (mobile == false) {
        var movementPad = document.querySelector(".movement-pad");
        // remove the element
        if (movementPad != undefined) movementPad.parentNode.removeChild(movementPad);
    }
    
    const moveSpeed = playerSpeed * delta * (1 + Number(isSprinting) * playerSpeedSprintMod);
    
    if (keys['KeyW'] || keys['ArrowUp'] || touchControls.moveForward) {
        if (mobile && touchControls.moveBackward)
        {
            camera.position.z -= moveSpeed;
        } else
        {
            // forward movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.crossVectors(camera.up, moveVector);
            moveVector.multiplyScalar(moveSpeed);
    
            camera.position.addScaledVector(moveVector, 1);
        }
    }
    if (keys['KeyS'] || keys['ArrowDown'] || touchControls.moveBackward) {
        if (mobile && touchControls.moveBackward)
        {
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.crossVectors(camera.up, moveVector);
            moveVector.multiplyScalar(moveSpeed);
    
            camera.position.addScaledVector(moveVector, -1);
        }
        else
        {
            // backward movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.crossVectors(camera.up, moveVector);
            moveVector.multiplyScalar(moveSpeed);
    
            camera.position.addScaledVector(moveVector, -1);
        }
    }
    if (keys['KeyA'] || keys['ArrowLeft'] || touchControls.moveLeft) {
        if (mobile && touchControls.moveLeft)
        {
            camera.position.x += moveSpeed;
        }
        else
        {
            // left movement
            moveVector.setFromMatrixColumn(camera.matrix, 0);
            moveVector.multiplyScalar(moveSpeed);
            camera.position.addScaledVector(moveVector, -1);
        }

    }
    if (keys['KeyD'] || keys['ArrowRight'] || touchControls.moveRight) {
        if (mobile && touchControls.moveRight)
        {
            camera.position.x -= moveSpeed;
        }
        else
        {
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
    chunkPositions.push(pos);

    // chunk
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

    return true;
}

generateChunk(new THREE.Vector2(0, 0));

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