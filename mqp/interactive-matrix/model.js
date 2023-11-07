class Model {
    constructor(fileName, shader) {
        this.meshes = [];
        this.parseHardCoded(shader);
        // this.parseFile(fileName, this.meshes, shader);
    }

    draw(shader, camera) {
        for (var i = 0; i < this.meshes.length; i++) {
           this.meshes[i].draw(shader, camera);
        }
    }

    parseHardCoded(shader) {
        // materials
        var sampleMaterial = new Material("sampleMaterial");
        sampleMaterial.ambient = vec3(1.0, 1.0, 1.0);
        sampleMaterial.diffuse = vec3(0.0, 1.0, 0.0);
        sampleMaterial.specular = vec3(0.0, 0.0, 1.0);
        sampleMaterial.shininess = 10.0;

        // colors
        var red = vec3(1.0, 0.0, 0.0);
        var cyan = vec3(0.0, 1.0, 1.0);
        var green = vec3(0.0, 1.0, 0.0);
        var magenta = vec3(1.0, 0.0, 1.0);
        var blue = vec3(0.0, 0.0, 1.0);
        var yellow = vec3(1.0, 1.0, 0.0);

        // uvs
        var universalUV = vec2(0.0, 0.0);

        // normals
        var frontNormal = vec3(0.0, 0.0, 1.0);
        var backNormal = vec3(0.0, 0.0, -1.0);
        var rightNormal = vec3(1.0, 0.0, 0.0);
        var leftNormal = vec3(-1.0, 0.0, 0.0);
        var topNormal = vec3(0.0, 1.0, 0.0);
        var bottomNormal = vec3(0.0, -1.0, 0.0);

        // vertices
        var positions = [
            vec3(0.5, 0.5, 0.5),
            vec3(-0.5, 0.5, 0.5),
            vec3(-0.5, -0.5, 0.5),
            vec3(0.5, -0.5, 0.5),
            vec3(0.5, 0.5, -0.5),
            vec3(-0.5, 0.5, -0.5),
            vec3(-0.5, -0.5, -0.5),
            vec3(0.5, -0.5, -0.5)
        ];

        var rightTopFront = 0;
        var leftTopFront = 1;
        var leftBottomFront = 2;
        var rightBottomFront = 3;
        var rightTopBack = 4;
        var leftTopBack = 5;
        var leftBottomBack = 6;
        var rightBottomBack = 7;

        var vertexList = [
            new Vertex(positions[rightTopFront], frontNormal, cyan, universalUV),
            new Vertex(positions[rightBottomFront], frontNormal, cyan, universalUV),
            new Vertex(positions[leftBottomFront], frontNormal, cyan, universalUV),
            new Vertex(positions[leftTopFront], frontNormal, cyan, universalUV),

            new Vertex(positions[leftTopBack], backNormal, red, universalUV),
            new Vertex(positions[leftBottomBack], backNormal, red, universalUV),
            new Vertex(positions[rightBottomBack], backNormal, red, universalUV),
            new Vertex(positions[rightTopBack], backNormal, red, universalUV),

            new Vertex(positions[rightTopBack], rightNormal, magenta, universalUV),
            new Vertex(positions[rightBottomBack], rightNormal, magenta, universalUV),
            new Vertex(positions[rightBottomFront], rightNormal, magenta, universalUV),
            new Vertex(positions[rightTopFront], rightNormal, magenta, universalUV),

            new Vertex(positions[leftTopFront], leftNormal, green, universalUV),
            new Vertex(positions[leftBottomFront], leftNormal, green, universalUV),
            new Vertex(positions[leftBottomBack], leftNormal, green, universalUV),
            new Vertex(positions[leftTopBack], leftNormal, green, universalUV),

            new Vertex(positions[rightTopBack], topNormal, blue, universalUV),
            new Vertex(positions[rightTopFront], topNormal, blue, universalUV),
            new Vertex(positions[leftTopFront], topNormal, blue, universalUV),
            new Vertex(positions[leftTopBack], topNormal, blue, universalUV),

            new Vertex(positions[rightBottomFront], bottomNormal, yellow, universalUV),
            new Vertex(positions[rightBottomBack], bottomNormal, yellow, universalUV),
            new Vertex(positions[leftBottomBack], bottomNormal, yellow, universalUV),
            new Vertex(positions[leftBottomFront], bottomNormal, yellow, universalUV),
        ];

        // indices
        var indexList = [
            0, 1, 2,
            0, 2, 3,

            4, 5, 6,
            4, 6, 7,

            8, 9, 10,
            8, 10, 11,

            12, 13, 14,
            12, 14, 15,

            16, 17, 18,
            16, 18, 19,

            20, 21, 22,
            20, 22, 23,
        ];

        // create mesh
        var mesh = new Mesh(vertexList, indexList, sampleMaterial, [], shader);
        this.meshes.push(mesh);
    }

    static constructMesh(materialGroup, material, shader) {
        // extract material properties
        var diffuseColor = material.getKd();
        var textureMap = material.getMapKd();
        var specularMap = material.getMapKs();
        var bumpMap = material.getBump();

        // extract geometry data
        var vertices = [];
        var normals = [];
        var uvs = [];
        var indices = [];

        for (var i = 0; i < materialGroup.faces.length; i++) {
            var face = materialGroup.faces[i];
            var faceVertices = face.vertices;
            var faceNormals = face.normals;
            var faceUVs = face.uvs;
            var faceIndices = face.indices;

            for (var j = 0; j < faceVertices.length; j++) {
                var vertex = faceVertices[j];
                var normal = faceNormals[j];
                var uv = faceUVs[j];
                var index = faceIndices[j];

                vertices.push(vertex[0]);
                vertices.push(vertex[1]);
                vertices.push(vertex[2]);

                normals.push(normal[0]);
                normals.push(normal[1]);
                normals.push(normal[2]);

                uvs.push(uv[0]);
                uvs.push(uv[1]);

                indices.push(index);
            }
        }

        // create mesh
        var vertexList = [];
        var indexList = [];
        var textureList = [];

        // add vertices and indices to mesh
        var i;
        for (i = 0; i < vertices.length / 3; i++) {
            var x = vertices[i * 3 + 0];
            var y = vertices[i * 3 + 1];
            var z = vertices[i * 3 + 2];
            var nx = normals[i * 3 + 0];
            var ny = normals[i * 3 + 1];
            var nz = normals[i * 3 + 2];
            var r = diffuseColor[0];
            var g = diffuseColor[1];
            var b = diffuseColor[2];
            var u = uvs[i * 2 + 0];
            var v = uvs[i * 2 + 1];
            var vertex = new Vertex(vec3(x, y, z), vec3(nx, ny, nz), vec3(r, g, b), vec2(u, v));
            vertexList.push(vertex);
        }

        for (i = 0; i < indices.length; i++) {
            indexList.push(indices[i]);
        }

        // create textures
        if (textureMap != null) {
            var texture = new Texture(textureMap, "diffuse", 0);
            textureList.push(texture);
        }
        if (specularMap != null) {
            var texture = new Texture(specularMap, "specular", 1);
            textureList.push(texture);
        }
        if (bumpMap != null) {
            var texture = new Texture(bumpMap, "normal", 2);
            textureList.push(texture);
        }

        return new Mesh(vertexList, indexList, material, textureList, shader);
    }

    parseFile(fileName, meshList, shader) {
        // get renderable objects
        var obj = new OBJ();

        // get obj file contents
        var objRequest = new XMLHttpRequest();
        objRequest.open("GET", "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/" + fileName);
        objRequest.onreadystatechange = function () {
            if (objRequest.readyState === 4 && objRequest.status === 200) {
                obj.objFile = objRequest.responseText;
                
                // Split and sanitize OBJ file input
                var objLines = obj.objFile.split('\n');
                objLines = objLines.filter(line => {
                    return (line.search(/\S/) !== -1);
                });
                objLines = objLines.map(line => {
                    return line.trim();
                });

                // Get lines in OBJ file until material library definition
                var currLine = 0;
                var line = objLines[currLine];
                while (!line.startsWith("mtllib")) { // Material library definition
                    line = objLines[++currLine];
                }

                var materialLibraryName = line.split(" ")[1];

                // get MTL file contents
                var mtlFile = null;
                var mtlRequest = new XMLHttpRequest();
                mtlRequest.open("GET", "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3/" + materialLibraryName);
                mtlRequest.onreadystatechange = function () {
                    if (mtlRequest.readyState === 4 && mtlRequest.status === 200) {
                        mtlFile = mtlRequest.responseText;

                        // parse MTL file
                        obj.parseMTLFile(mtlFile);

                        // parse OBJ file
                        obj.parseOBJFile(objLines, currLine + 1);

                        // get material groups
                        var materialGroups = obj.getMaterialGroups();

                        // construct meshes
                        for (var i = 0; i < materialGroups.length; i++) {
                            var materialGroup = materialGroups[i].triangulate();
                            var material = materialGroups[i].material;
                            var mesh = Model.constructMesh(materialGroup, material, shader);
                            meshList.push(mesh);
                        }
                    }
                }
                mtlRequest.send(null);
            }
        }
        objRequest.send(null);
    }
}