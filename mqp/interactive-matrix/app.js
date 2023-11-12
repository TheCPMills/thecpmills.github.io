// =================
// ==== GLOBALS ====
// =================
var canvas, gl, shaderProgram;
var width, height, aspectRatio;
var n = 1;
var m = 1;

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
var alpha = 0.01 * Math.min(n, m);
var time = -1.0;
var mouseLastX, mouseLastY;
var mouseDown = false;
var camera;

// =================
// ==== PROGRAM ====
// =================
function main() {
    // Create the window
    canvas = document.getElementById('window');

    document.getElementById("n").value = n;
    document.getElementById("m").value = m;

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
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "useTexture"), 1);
    } else {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "useTexture"), 0);
    }

    // render the scene
    render();
}

function render() {
    // clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // if the model is loaded
    if (objectModel.modelLoaded) {
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

        // rotate light around <0, 1, 0>
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
    }

    // request new frame
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
        var shouldRotate = false;
        if (n < m) {
            var temp = n;
            n = m;
            m = temp;
            shouldRotate = true;
        }

        objectModel = new Model("model_" + n + "x" + m + ".obj", shader);

        // Generate model matrix
        var offset = vec3(-Math.pow(2, n - 1), 0, Math.pow(2, m - 1));
        modelMatrix = mult(rotateAxis(90.0, vec3(0.0, 1.0, 0.0)), translate(offset));

        if (shouldRotate) {
            modelMatrix = mult(rotateAxis(90.0, vec3(0.0, 1.0, 0.0)), modelMatrix);
        }
    }

    // lighting initialization
    if (n <= 0 || m <= 0) {
        lights.push(new PointLight(vec3(-0.375, 0.75, 0.375), vec3(2.0, 3.5, 2.5), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
        // lights.push(new DirectionalLight(vec3(0.0, -1.0, -1.0), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
        // lights.push(new SpotLight(vec3(-0.375, 0.75, -0.375), vec3(0.0, -1.0, 0.0), vec3(2.0, 3.5, 2.5), 35.0, 45.0, 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
    } else {
        lights.push(new PointLight(vec3(0.0, Math.min(n, m) + 1.0, 0.0), vec3(2.0, 1.5, 0.5), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));
    }

    // camera initialization
    var orthoSize = n * m;
    var perspectiveStart = vec3(-Math.pow(2, n) + n, Math.pow(2, Math.min(n, m)) + Math.min(n, m), -Math.pow(2, m - 1) - m - 1);

    perspectiveMatrix = perspective(70.0, width / height, 0.1, 100.0);
    perspectiveEye = vec3(perspectiveStart[0], perspectiveStart[1], perspectiveStart[2]);
    perspectiveOrientation = vec3(-1.0, 1.0, -1.0);
    perspectiveUp = vec3(0.0, 1.0, 0.0);
    orthoMatrix = ortho(-orthoSize * aspectRatio, orthoSize * aspectRatio, -orthoSize, orthoSize, 0.1, 100.0);
    orthoEye = vec3(Math.pow(2, n), Math.min(n, m) + 1, m / 2 - 1);
    orthoOrientation = vec3(0.0, 1.0, 0.0);
    orthoUp = vec3(0.0, 0.0, 1.0);

    camera = new GenericCamera(width, height, perspectiveEye, perspectiveOrientation, perspectiveMatrix); // custom camera
    camera.speed = 0.1 * Math.min(n, m);
}

function changeMatrix() {
    var nInput = document.getElementById("n");
    var mInput = document.getElementById("m");

    n = parseInt(nInput.value);
    m = parseInt(mInput.value);

    initializeMLC(shaderProgram);
    isPerspective = true;
    camera.isPerspective = true;
    time = -1.0;
}

var wPressed = false;
var aPressed = false;
var sPressed = false;
var dPressed = false;
var spacePressed = false;
var shiftPressed = false;

document.onkeydown = function (event) {
    var key = String.fromCharCode(event.keyCode);

    if (!isAnimating) {
        if (key == 'Z') {
            isAnimating = true;
        }
        if (key == 'R') {
            initializeMLC(shaderProgram);
            isPerspective = true;
            camera.isPerspective = true;
            time = -1.0;
        }

        if (key == 'W') {
            wPressed = true;
        }
        if (key == 'A') {
            aPressed = true;
        }
        if (key == 'S') {
            sPressed = true;
        }
        if (key == 'D') {
            dPressed = true;
        }
        if (key == ' ') {
            spacePressed = true;
        }
        if (event.shiftKey) {
            shiftPressed = true;
        }

        if (!isAnimating) {
            if (isPerspective) {
                if (wPressed) {
                    camera.setPosition(add(camera.position, scale(-camera.speed, camera.orientation)));
                }
                if (aPressed) {
                    camera.setPosition(add(camera.position, scale(camera.speed, normalize(cross(camera.orientation, camera.worldUp)))));
                }
                if (sPressed) {
                    camera.setPosition(add(camera.position, scale(camera.speed, camera.orientation)));
                }
                if (dPressed) {
                    camera.setPosition(add(camera.position, scale(-camera.speed, normalize(cross(camera.orientation, camera.worldUp)))));
                }
                if (spacePressed) {
                    camera.setPosition(add(camera.position, scale(camera.speed, camera.worldUp)));
                }
                if (shiftPressed) {
                    camera.setPosition(add(camera.position, scale(-camera.speed, camera.worldUp)));
                }
            } else {
                if (wPressed) {
                    camera.setPosition(add(camera.position, scale(camera.speed, vec3(0.0, 0.0, 1.0))));
                }
                if (aPressed) {
                    camera.setPosition(add(camera.position, scale(camera.speed, vec3(1.0, 0.0, 0.0))));
                }
                if (sPressed) {
                    camera.setPosition(add(camera.position, scale(-camera.speed, vec3(0.0, 0.0, 1.0))));
                }
                if (dPressed) {
                    camera.setPosition(add(camera.position, scale(-camera.speed, vec3(1.0, 0.0, 0.0))));
                }
            }
        }
    }
}

document.onkeyup = function (event) {
    var key = String.fromCharCode(event.keyCode);

    if (key == 'W') {
        wPressed = false;
    }
    if (key == 'A') {
        aPressed = false;
    }
    if (key == 'S') {
        sPressed = false;
    }
    if (key == 'D') {
        dPressed = false;
    }
    if (key == ' ') {
        spacePressed = false;
    }
    if (event.shiftKey) {
        shiftPressed = false;
    }
}

document.onmousedown = function (event) {
    if (!isAnimating && !mouseDown && isPerspective) {
        if (event.button == 0) {
            canvas.style.cursor = "none";
            mouseLastX = event.clientX;
            mouseLastY = event.clientY;
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
    if (event.target == canvas) {
        if (!isAnimating && mouseDown) {
            var mouseX = event.clientX;
            var mouseY = event.clientY;

            var rotX = camera.sensitivity * (mouseX - mouseLastX) / 100;
            var rotY = camera.sensitivity * (mouseY - mouseLastY) / 100;

            camera.setOrientation(rotate(camera.orientation, vec3(0.0, 1.0, 0.0), radians(-rotX)));
            camera.setOrientation(rotate(camera.orientation, normalize(cross(camera.orientation, camera.worldUp)), radians(rotY)));

            mouseLastX = mouseX;
            mouseLastY = mouseY;
        }
    }
}