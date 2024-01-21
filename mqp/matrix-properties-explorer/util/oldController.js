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