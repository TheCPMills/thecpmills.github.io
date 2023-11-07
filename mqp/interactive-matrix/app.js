// =================
// ==== GLOBALS ====
// =================
var canvas, gl, shaderProgram;
var width, height, aspectRatio;
var n = 0;
var m = 0;

// ==============================
// ==== MODEL INITIALIZATION ====
// ==============================
var objectModel;
var modelMatrix;

// =================================
// ==== LIGHTING INITIALIZATION ====
// =================================
var lights = [];

// ===============================
// ==== CAMERA INITIALIZATION ====
// ===============================
var perspectiveMatrix, orthoMatrix;
var perspectiveEye, orthoEye;
var perspectiveOrientation, orthoOrientation;
var perspectiveUp, orthoUp;
var isPerspective = true;
var isAnimating = false;
var alpha = 0.01;
var time = -1.0;
var mouseDown = false;
var camera;

// =================
// ==== PROGRAM ====
// =================
function main() {
    // Create the window
    canvas = document.getElementById('window');

    // specify the viewport in the window
    gl = WebGLUtils.setupWebGL(canvas);

    // Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set viewport
    width = canvas.width;
    height = canvas.height;
    aspectRatio = width / height;
    gl.viewport(0, 0, width, height);

    // enable the depth buffer and backface culling
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CW);

    // set background color
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    // initialize and activate shader program
    shaderProgram = initShaders(gl, "vertexShader", "fragmentShader");
    gl.useProgram(shaderProgram);

    // Initialize models, lighting, and camera
    initializeMLC(shaderProgram);

    // initialize uniforms
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "modelMatrix"), false, flatten(modelMatrix));
    if (n <= 0 || m <= 0) {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "useTexture"), 0);
    } else {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "useTexture"), 1);
    }

    // render the scene
    render();
}

function render() {
    // clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update camera matrix
    if (!isAnimating) {
        if (isPerspective) {
            perspectiveEye = camera.position;
            perspectiveOrientation = camera.orientation;
        } else {
            orthoEye = camera.position;
            orthoOrientation = camera.orientation;
        }
    } else {
        toggleCameraType();
    }

    // update camera
    camera.update(shaderProgram, "cameraMatrix");

    // get label element and update text
    var cameraInformationLabel = document.getElementById("cameraInformation");
    var positionText = "Position: [" + camera.position[0].toFixed(4) + ", " + camera.position[1].toFixed(4) + ", " + camera.position[2].toFixed(4) + "]";
    var orientationText = "Orientation: [" + camera.orientation[0].toFixed(4) + ", " + camera.orientation[1].toFixed(4) + ", " + camera.orientation[2].toFixed(4) + "]";

    cameraInformationLabel.innerHTML = positionText + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + orientationText;

    // rotate light around <0, 0, 0>
    // if (n <= 0 || m <= 0) {
    //     var mainLight = lights[0];
    //     if (mainLight.type == 1 || mainLight.type == 3) {
    //         mainLight.position = rotate(mainLight.position, vec3(0.0, 1.0, 0.0), alpha);
    //     }
    // }

    // update lighting
    Light.updateAll(shaderProgram, lights);

    // draw mesh
    objectModel.draw(shaderProgram, camera);

    requestAnimFrame(render);
}

function toggleCameraType() {
    var mixAmount = Math.sin(time * Math.PI / 2.0) * 0.5 + 0.5;
    var projectionMatrix = mat4();

    projectionMatrix[0] = mix(perspectiveMatrix[0], orthoMatrix[0], mixAmount);
    projectionMatrix[1] = mix(perspectiveMatrix[1], orthoMatrix[1], mixAmount);
    projectionMatrix[2] = mix(perspectiveMatrix[2], orthoMatrix[2], mixAmount);
    projectionMatrix[3] = mix(perspectiveMatrix[3], orthoMatrix[3], mixAmount);

    camera.projectionMatrix = projectionMatrix;

    var eye = mix(perspectiveEye, orthoEye, mixAmount);
    var orientation = mix(perspectiveOrientation, orthoOrientation, mixAmount);
    var up = mix(perspectiveUp, orthoUp, mixAmount);

    camera.setPosition(eye);
    camera.setOrientation(orientation);
    camera.setWorldUp(up);

    // update time
    if (isPerspective) {
        time += alpha;
    } else {
        time -= alpha;
    }

    // round time to 4 decimal places
    time = Math.round(time * 10000.0) / 10000.0;

    // update isPerspective
    if (time >= 1.0) {
        isPerspective = false;
        camera.isPerspective = false;
        isAnimating = false;
    } else if (time <= -1.0) {
        isPerspective = true;
        camera.isPerspective = true;
        isAnimating = false;
    }
}

function initializeMLC(shader) {
    // model initialization
    if (n <= 0 || m <= 0) {
        objectModel = new Model("referenceCube.obj", shader);
        modelMatrix = mat4();
    } else {
        // Generate model
        objectModel = new Model("model_" + n + "x" + m + ".obj", shader);

        // Generate model matrix
        var offset = vec3(0.0, 0.0, 0.0); // vec3(-Math.pow(2, n - 1), 0, Math.pow(2, m - 1));
        modelMatrix = mult(rotateAxis(0.0, vec3(0.0, 1.0, 0.0)), translate(offset)); // 
    }

    // lighting initialization
    if (n <= 0 || m <= 0) {
        // lights.push(new PointLight(vec3(-0.375, 0.75, 0.375), vec3(2.0, 3.5, 2.5), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
        // lights.push(new DirectionalLight(vec3(0.0, -1.0, -1.0), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
        // lights.push(new SpotLight(vec3(-0.375, 0.75, -0.375), vec3(0.0, -1.0, 0.0), vec3(2.0, 3.5, 2.5), 35.0, 45.0, 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
    } else {
        lights.push(new PointLight(vec3(0.0, Math.min(n, m) + 1, 0.0), vec3(2.0, 1.5, 0.5), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
    }

    // camera initialization
    perspectiveMatrix = perspective(70.0, width / height, 0.1, 100.0);
    orthoMatrix = ortho(-(2.0 + n) * aspectRatio, (2.0 + n) * aspectRatio, -(2.0 + n), (2.0 + n), 0.1, 100.0);
    perspectiveEye = vec3(-2.0 - n, 2.0 + n, -2.0 - n);
    orthoEye = vec3(0.0, 10.0 + n, 0.0);
    perspectiveOrientation = vec3(-1.0, 1.0, -1.0);
    orthoOrientation = vec3(0.0, 1.0, 0.0);
    perspectiveUp = vec3(0.0, 1.0, 0.0);
    orthoUp = vec3(0.0, 0.0, 1.0);

    camera = new GenericCamera(width, height, perspectiveEye, perspectiveOrientation, perspectiveMatrix); // custom camera
}

document.onkeydown = function (event) {
    var key = String.fromCharCode(event.keyCode);

    if (!isAnimating) {
        if (key == 'Z') {
            isAnimating = true;
        }

        if (isPerspective) {
            if (key == 'W') {
                camera.setPosition(add(camera.position, scale(-camera.speed, camera.orientation)));
            }
            if (key == 'A') {
                camera.setPosition(add(camera.position, scale(camera.speed, normalize(cross(camera.orientation, camera.worldUp)))));
            }
            if (key == 'S') {
                camera.setPosition(add(camera.position, scale(camera.speed, camera.orientation)));
            }
            if (key == 'D') {
                camera.setPosition(add(camera.position, scale(-camera.speed, normalize(cross(camera.orientation, camera.worldUp)))));
            }

            // SPACE key
            if (key == ' ') {
                camera.setPosition(add(camera.position, scale(camera.speed, camera.worldUp)));
            }
            // LEFT SHIFT key
            if (event.shiftKey) {
                camera.setPosition(add(camera.position, scale(-camera.speed, camera.worldUp)));
            }

            // O key
            if (key == 'I') {
                camera.setOrientation(rotate(camera.orientation, vec3(1.0, 0.0, 0.0), radians(1.0)));
            }
            // I key
            if (key == 'O') {
                camera.setOrientation(rotate(camera.orientation, vec3(1.0, 0.0, 0.0), radians(-1.0)));
            }

            // J key
            if (key == 'J') {
                camera.setOrientation(rotate(camera.orientation, vec3(0.0, 1.0, 0.0), radians(1.0)));
            }
            // K key
            if (key == 'K') {
                camera.setOrientation(rotate(camera.orientation, vec3(0.0, 1.0, 0.0), radians(-1.0)));
            }

            // N key
            if (key == 'N') {
                camera.setOrientation(rotate(camera.orientation, vec3(0.0, 0.0, 1.0), radians(1.0)));
            }
            // M key
            if (key == 'M') {
                camera.setOrientation(rotate(camera.orientation, vec3(0.0, 0.0, 1.0), radians(-1.0)));
            }

            // 
        } else {
            if (key == 'W') {
                camera.setPosition(add(camera.position, scale(camera.speed, vec3(0.0, 0.0, 1.0))));
            }
            if (key == 'A') {
                camera.setPosition(add(camera.position, scale(camera.speed, vec3(1.0, 0.0, 0.0))));
            }
            if (key == 'S') {
                camera.setPosition(add(camera.position, scale(-camera.speed, vec3(0.0, 0.0, 1.0))));
            }
            if (key == 'D') {
                camera.setPosition(add(camera.position, scale(-camera.speed, vec3(1.0, 0.0, 0.0))));
            }
        }
    }
}

document.onmousedown = function (event) {
    if (!isAnimating && !mouseDown && isPerspective) {
        if (event.button == 0) {
            // canvas.style.cursor = "none";
            mouseDown = true;
        }
    }
}

document.onmouseup = function (event) {
    if (!isAnimating && mouseDown && isPerspective) {
        if (event.button == 0) {
            canvas.style.cursor = "default";
            mouseDown = false;
        }
    }
}

document.onmousemove = function (event) {
    // if mouse over canvas
    if (event.target == canvas) {
        if (!isAnimating && mouseDown) {
            var mouseX = event.clientX;
            var mouseY = event.clientY;

            var rotX = camera.sensitivity * (mouseY - (height / 2)) / height;
            var rotY = camera.sensitivity * (mouseX - (width / 2)) / width;

            var newOrientation = rotate(negate(camera.orientation), normalize(cross(negate(camera.orientation), camera.worldUp)), radians(rotX));

            if (Math.abs(angle(newOrientation, camera.worldUp)) - radians(90.0) <= radians(75.0)) {
                camera.setOrientation(newOrientation);
            }

            camera.setOrientation(rotate(negate(camera.orientation), camera.worldUp, radians(rotY)));

            // set mouse position to center of canvas
        }
    }
}