// =================
// ==== GLOBALS ====
// =================
var canvas, gl, shaderProgram;
var width, height, aspectRatio;
var xBox, yBox, lcsButton;
var kBox, kButton;
var lcsGenerated;
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
var orthoSize;
var perspectiveStart;
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
    setup();

    document.getElementById("n").value = n;
    document.getElementById("m").value = m;

    xBox = document.getElementById("x-box");
    yBox = document.getElementById("y-box");
    lcsButton = document.getElementById("lcs-button");
    kBox = document.getElementById("k-box");
    kButton = document.getElementById("k-button");
    lcsGenerated = false;

    xBox.value = "";
    yBox.value = "";
    lcsButton.disabled = true;
    kBox.value = "";
    kButton.disabled = true;

    xBox.onkeyup = function () {
        if (xBox.value.length != n || yBox.value.length != m) {
            lcsButton.disabled = true;
        } else {
            lcsButton.disabled = false;
        }
    }

    yBox.onkeyup = function () {
        if (xBox.value.length != n || yBox.value.length != m) {
            lcsButton.disabled = true;
        } else {
            lcsButton.disabled = false;
        }
    }

    kBox.onkeyup = function () {
        var k = parseInt(kBox.value);
        if (kBox.value.length > 0 && (k >= 0 && k < m) && lcsGenerated) {
            kButton.disabled = false;
        } else {
            kButton.disabled = true;
        }
    }

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
    gl.frontFace(gl.CCW);

    // set background color
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    // initialize and activate shader program
    shaderProgram = createShaderProgram(gl, "vertexShader", "fragmentShader");
    gl.useProgram(shaderProgram);

    // Initialize models, lighting, and camera
    initializeMLC(shaderProgram);

    // initialize uniforms
    if (n <= 0 || m <= 0) {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "useTexture"), 1);
    } else {
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "useTexture"), 0);
    }

    // render the scene
    render();
}

window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function setup() {
    var onMobile = mobileAndTabletCheck();
    if (onMobile) { // if on a mobile device
        canvas.width = window.innerWidth * 0.875;
        canvas.height = canvas.width * 0.6667;

        var panel = document.getElementById("panel");
        panel.parentNode.removeChild(panel); // remove div from main div
        document.body.appendChild(panel); // add div to body
        panel.style.width = canvas.width + "px";

        // remove computerControls div
        var computerControls = document.getElementById("computerControls");
        computerControls.parentNode.removeChild(computerControls);
    } else { // if on a computer
        canvas.width = window.innerWidth * 0.51;
        canvas.height = canvas.width * 0.6667;

        // remove mobileControls div
        var mobileControls = document.getElementById("mobileControls");
        mobileControls.parentNode.removeChild(mobileControls);
    }

    document.getElementById("matrixDimensions").style.height = canvas.height * 0.2362 + "px";
    document.getElementById("break1").style.height = canvas.height * 0.0536 + "px";
    document.getElementById("lcsInformation").style.height = canvas.height * 0.3256 + "px";
    document.getElementById("break2").style.height = canvas.height * 0.0536 + "px";
    document.getElementById("compareLCS").style.height = canvas.height * 0.3256 + "px";
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

        // update lighting
        Light.updateAll(shaderProgram, lights);

        // update model matrix
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "modelMatrix"), false, flatten(modelMatrix));

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
    objectModel = new Model("model_" + n + "x" + m + ".obj", shader);

    // Generate model matrix
    var offset = vec3(-Math.pow(2, n - 1), 0, -Math.pow(2, m - 1));
    var reflectionPlane = vec4(1.0, 0.0, 0.0, 0.0);
    modelMatrix = mult(reflectionMatrix(reflectionPlane), translationMatrix(offset));

    // lighting initialization
    lights.push(new PointLight(vec3(0.0, Math.min(n, m) + 1.0, 0.0), vec3(2.0, 1.5, 0.5), 0.5, vec4(1.0, 0.98, 1.0, 1.0)));

    // camera initialization
    orthoSize = Math.pow(2, Math.max(n, m) - 1.0) + 1.0;
    perspectiveStart = vec3(0.0, Math.min(n, m) + 1, -(0.5 * n + 2.0 + Math.pow(2, m - 1)));

    perspectiveMatrix = perspective(70.0, width / height, 0.1, 100.0);
    perspectiveEye = vec3(perspectiveStart[0], perspectiveStart[1], perspectiveStart[2]);
    perspectiveOrientation = vec3(0.0, 4.0, -8.0);
    perspectiveUp = vec3(0.0, 1.0, 0.0);
    orthoMatrix = ortho(-orthoSize * aspectRatio, orthoSize * aspectRatio, -orthoSize, orthoSize, 0.1, 100.0);
    orthoEye = vec3(0, orthoSize, 0);
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

    // if n or m is not a number
    if (isNaN(n) || isNaN(m) || n < 1 || m < 1 || n > 5 || m > 5) {
        alert("Invalid dimensions. Please enter dimensions between 1 and 5.");
        return;
    }

    if (n >= 4 || m >= 4) {
        var answer = confirm("Larger models may take longer than usual to render.\nWould you like to continue?");
        if (!answer) {
            return;
        }
    }

    xBox.value = "";
    yBox.value = "";
    document.getElementById("lcs-length").innerHTML = "Length of Longest Common Subsequence: 0";
    document.getElementById("lcs-set").innerHTML = "Set of Longest Common Subsequences: {}";
    lcsButton.disabled = true;
    lcsGenerated = false;
    kBox.value = "";
    document.getElementById("zBox").innerHTML = "New Second String: -";
    document.getElementById("k-length").innerHTML = "Length of Longest Common Subsequence: 0";
    document.getElementById("k-set").innerHTML = "Set of Longest Common Subsequences: {}";
    kButton.disabled = true;
    
    initializeMLC(shaderProgram);
    isPerspective = true;
    camera.isPerspective = true;
    time = -1.0;
    alpha = 0.01 * Math.min(n, m);

    console.log(camera.projectionMatrix);
}

function changeLCS() {
    // convert from binary string to int
    var x = parseInt(xBox.value, 2);
    var y = parseInt(yBox.value, 2);

    // select mesh
    var index = x * Math.pow(2, m) + y;
    objectModel.select(index);

    var lcsLength = objectModel.meshes[index].vertices[0].position[1];
    var setOfLCSs = Array.from(lcsSet(xBox.value, yBox.value));

    var lcsLengthLabel = document.getElementById("lcs-length");
    lcsLengthLabel.innerHTML = "Length of Longest Common Subsequence: " + lcsLength;

    var lcsSetLabel = document.getElementById("lcs-set");
    lcsSetLabel.innerHTML = "Set of Longest Common Subsequences: {" + setOfLCSs + "}";

    lcsGenerated = true;
    var k = parseInt(kBox.value);
    if (kBox.value.length > 0 && (k >= 0 && k < m)) {
        kButton.disabled = false;
    }
}

function changeK() {
    var k = parseInt(kBox.value);

    // convert from binary string to int
    var x = parseInt(xBox.value, 2);
    var y = parseInt(yBox.value, 2);

    // complement kth bit from left
    var z = y ^ (1 << (yBox.value.length - 1 - k));
    var zBox = z.toString(2);

    // pad with zeros
    while (zBox.length < m) {
        zBox = "0" + zBox;
    }

    document.getElementById("zBox").innerHTML = "New Second String: " + zBox;

    // select mesh
    var index = x * Math.pow(2, m) + z;
    objectModel.selectK(index);

    var lcsLength = objectModel.meshes[index].vertices[0].position[1];
    var setOfLCSs = Array.from(lcsSet(xBox.value, zBox));

    var kLengthLabel = document.getElementById("k-length");
    kLengthLabel.innerHTML = "Length of Longest Common Subsequence: " + lcsLength;

    var kSetLabel = document.getElementById("k-set");
    kSetLabel.innerHTML = "Set of Longest Common Subsequences: {" + setOfLCSs + "}";
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
                if (spacePressed) {
                    orthoSize += 0.1 * Math.min(n, m);
                    orthoEye = vec3(camera.position[0], orthoSize, camera.position[2]);
                    orthoMatrix = ortho(-orthoSize * aspectRatio, orthoSize * aspectRatio, -orthoSize, orthoSize, 0.1, 100.0);
                    camera.projectionMatrix = orthoMatrix;
                    camera.setPosition(orthoEye);
                }
                if (shiftPressed) {
                    orthoSize -= 0.1 * Math.min(n, m);
                    orthoEye = vec3(camera.position[0], orthoSize, camera.position[2]);
                    orthoMatrix = ortho(-orthoSize * aspectRatio, orthoSize * aspectRatio, -orthoSize, orthoSize, 0.1, 100.0);
                    camera.projectionMatrix = orthoMatrix;
                    camera.setPosition(orthoEye);
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
    if (!event.shiftKey) {
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

document.addEventListener("touchstart", function (event) {
    if (!isAnimating && !mouseDown && isPerspective) {
        canvas.style.cursor = "none";
        mouseLastX = event.touches[0].clientX;
        mouseLastY = event.touches[0].clientY;
        mouseDown = true;
    }
});

document.addEventListener("touchend", function (event) {
    if (!isAnimating && mouseDown && isPerspective) {
        canvas.style.cursor = "default";
        mouseDown = false;
    }
});

document.addEventListener("touchmove", function (event) {
    if (event.target == canvas) {

        // disable scrolling
        event.preventDefault();
        event.stopPropagation();

        if (!isAnimating && mouseDown) {
            var mouseX = event.touches[0].clientX;
            var mouseY = event.touches[0].clientY;

            var rotX = camera.sensitivity * (mouseX - mouseLastX) / 100;
            var rotY = camera.sensitivity * (mouseY - mouseLastY) / 100;

            camera.setOrientation(rotate(camera.orientation, vec3(0.0, 1.0, 0.0), radians(-rotX)));
            camera.setOrientation(rotate(camera.orientation, normalize(cross(camera.orientation, camera.worldUp)), radians(rotY)));

            mouseLastX = mouseX;
            mouseLastY = mouseY;
        }
    }
});

var counter;
var count = 0;

function moveCameraUp() {
    counter = setInterval(function() {
        if (!isAnimating) {
            if (isPerspective) {
                camera.setPosition(add(camera.position, scale(camera.speed, camera.worldUp)));
            } else {
                orthoSize += 0.1 * Math.min(n, m);
                orthoEye = vec3(camera.position[0], orthoSize, camera.position[2]);
                orthoMatrix = ortho(-orthoSize * aspectRatio, orthoSize * aspectRatio, -orthoSize, orthoSize, 0.1, 100.0);
                camera.projectionMatrix = orthoMatrix;
                camera.setPosition(orthoEye);
            }
        }
    }, 25);
}

function moveCameraDown() {
    counter = setInterval(function() {
        if (!isAnimating) {
            if (isPerspective) {
                camera.setPosition(add(camera.position, scale(-camera.speed, camera.worldUp)));
            } else {
                orthoSize -= 0.1 * Math.min(n, m);
                orthoEye = vec3(camera.position[0], orthoSize, camera.position[2]);
                orthoMatrix = ortho(-orthoSize * aspectRatio, orthoSize * aspectRatio, -orthoSize, orthoSize, 0.1, 100.0);
                camera.projectionMatrix = orthoMatrix;
                camera.setPosition(orthoEye);
            }
        }
    }, 25);
}

function moveCameraLeft() {
    counter = setInterval(function() {
        if (!isAnimating) {
            if (isPerspective) {
                camera.setPosition(add(camera.position, scale(camera.speed, normalize(cross(camera.orientation, camera.worldUp)))));
            } else {
                camera.setPosition(add(camera.position, scale(camera.speed, vec3(1.0, 0.0, 0.0))));
            }
        }
    }, 25);
}

function moveCameraRight() {
    counter = setInterval(function() {
        if (!isAnimating) {
            if (isPerspective) {
                camera.setPosition(add(camera.position, scale(-camera.speed, normalize(cross(camera.orientation, camera.worldUp)))));
            } else {
                camera.setPosition(add(camera.position, scale(-camera.speed, vec3(1.0, 0.0, 0.0))));
            }
        }
    }, 25);
}

function moveCameraForward() {
    counter = setInterval(function() {
        if (!isAnimating) {
            if (isPerspective) {
                camera.setPosition(add(camera.position, scale(-camera.speed, camera.orientation)));
            } else {
                camera.setPosition(add(camera.position, scale(camera.speed, vec3(0.0, 0.0, 1.0))));
            }
        }
    }, 25);
}

function moveCameraBackward() {
    counter = setInterval(function() {
        if (!isAnimating) {
            if (isPerspective) {
                camera.setPosition(add(camera.position, scale(camera.speed, camera.orientation)));
            } else {
                camera.setPosition(add(camera.position, scale(-camera.speed, vec3(0.0, 0.0, 1.0))));
            }
        }
    }, 25);
}

function stopCamera() {
    if (!isAnimating) {
        clearInterval(counter);
    }
}

function togglePerspective() {
    if (!isAnimating) {
        isAnimating = true;
    }
}

function resetCamera() {
    if (!isAnimating) {
        initializeMLC(shaderProgram);
        isPerspective = true;
        camera.isPerspective = true;
        time = -1.0;
    }
}