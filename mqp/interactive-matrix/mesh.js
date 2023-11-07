class Mesh {
    constructor(vertices, indices, material, textures, shader) {
        this.vertices = vertices;
        this.indices = indices;
        this.material = material;
        this.textures = textures;
        this.vao = new VAO();

        // define attribute layouts
        var vertexPosition = gl.getAttribLocation(shader, "vertexPosition");
        var vertexNormal = gl.getAttribLocation(shader, "vertexNormal");
        var vertexColor = gl.getAttribLocation(shader, "vertexColor");
        var vertexUV = gl.getAttribLocation(shader, "vertexUV");

        // bind VAO
        this.vao.bind();
        var vbo = new VBO(vertices);
        var ebo = new EBO(indices);

        // link VBO attributes to VAO
        this.vao.linkAttribute(vbo, vertexPosition, 3, gl.FLOAT, 11 * 4, 0);
        this.vao.linkAttribute(vbo, vertexNormal, 3, gl.FLOAT, 11 * 4, 3 * 4);
        this.vao.linkAttribute(vbo, vertexColor, 3, gl.FLOAT, 11 * 4, 6 * 4);
        this.vao.linkAttribute(vbo, vertexUV, 3, gl.FLOAT, 11 * 4, 9 * 4);

        // bind EBO
        ebo.bind();

        // unbind all to prevent accidental modification
        this.vao.unbind();
        vbo.unbind();
    }

    draw(shader, camera) {
        gl.useProgram(shader);
        this.vao.bind();

        var numDiffuse = 0;
        var numSpecular = 0;
        var numNormal = 0;

        for (var i = 0; i < this.textures.length; i++) {
            var num = "";
            var type = this.textures[i].type;
            if (type == "diffuse") {
                num = numDiffuse++;
            } else if (type == "specular") {
                num = numSpecular++;
            } else if (type == "normal") {
                num = numNormal++;
            }
            this.textures[i].textureUnit(shader, type + num, i);
        }

        this.material.setUniforms(shader);

        gl.uniform3fv(gl.getUniformLocation(shader, "cameraPosition"), flatten(camera.position));
        camera.update(shader, "cameraMatrix");

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}