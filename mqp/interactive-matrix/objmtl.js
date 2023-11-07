class MaterialGroup {
    constructor(material) {
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.faces = [];
        this.material = material;
    }

    addVertex(vertex) {
        this.vertices.push(vertex);
    }

    addNormal(normal) {
        this.normals.push(normal);
    }

    addUV(uv) {
        this.uvs.push(uv);
    }

    addFace(face) {
        this.faces.push(face);
    }

    triangulate() {
        var triangulatedFaces = [];

        for (var i = 0; i < this.faces.length; i++) {
            var face = this.faces[i];

            // triangulate face
            var vertexIndices = face.vertexIndices;
            var normalIndices = face.normalIndices;
            var uvIndices = face.uvIndices;

            for (var j = 1; j < vertexIndices.length - 1; j++) {
                var vertexIndex1 = vertexIndices[0];
                var vertexIndex2 = vertexIndices[j];
                var vertexIndex3 = vertexIndices[j + 1];

                var normalIndex1 = normalIndices[0];
                var normalIndex2 = normalIndices[j];
                var normalIndex3 = normalIndices[j + 1];

                var uvIndex1 = uvIndices[0];
                var uvIndex2 = uvIndices[j];
                var uvIndex3 = uvIndices[j + 1];

                var triangulatedFace = new Face([vertexIndex1, vertexIndex2, vertexIndex3], [normalIndex1, normalIndex2, normalIndex3], [uvIndex1, uvIndex2, uvIndex3]);
                triangulatedFaces.push(triangulatedFace);
            }
        }

        return new MaterialGroup(this.material, this.vertices, this.normals, this.uvs, triangulatedFaces);
    }
}

class Material {
    constructor(name) {
        this.name = name;
        this.ambient = vec3();
        this.diffuse = vec3();
        this.specular = vec3();
        this.shininess = 0.0;
        this.diffuseMap = null;
        this.specularMap = null;
        this.bumpMap = null;
    }

    getKd() {
        return this.diffuse;
    }

    getMapKd() {
        return this.diffuseMap;
    }

    getMapKs() {
        return this.specularMap;
    }

    getBump() {
        return this.bumpMap;
    }

    setUniforms(shader) {
        if (this.ambient === null || this.specular === null || this.shininess === null) {
            throw new Error("Material is not fully defined. Please specify at least the ambient color, specular color, and shininess of the material.");
        }

        gl.uniform3fv(gl.getUniformLocation(shader, "materialAmbient"), flatten(this.ambient));
        gl.uniform3fv(gl.getUniformLocation(shader, "materialSpecular"), flatten(this.specular));
        gl.uniform1f(gl.getUniformLocation(shader, "materialShininess"), this.shininess);
    }
}

class Face {
    constructor(vertexIndices, normalIndices, uvIndices) {
        this.vertexIndices = vertexIndices;
        this.normalIndices = normalIndices;
        this.uvIndices = uvIndices;
    }
}

class OBJ {
    constructor() {
        this.vertices = [];
        this.normals = [];
        this.uvs = [];
        this.materials = [];
        this.materialGroups = [];

        this.objFile = null;
    }

    getMaterial(materialName) {
        for (var i = 0; i < this.materials.length; i++) {
            var material = this.materials[i];
            if (material.name === materialName) {
                return material;
            }
        }
    }

    getMaterialGroups() {
        return this.materialGroups;
    }

    parseMTLFile(mtlFile) {
        // Sanitize the MTL file
        var mtlLines = mtlFile.split('\n');
        mtlLines = mtlLines.filter(line => {
            return (line.search(/\S/) !== -1);
        });
        mtlLines = mtlLines.map(line => {
            return line.trim();
        });

        var currentMaterial = null;
        for (var currLine = 0; currLine < mtlLines.length; currLine++) {
            var line = mtlLines[currLine];

            if (line.startsWith("newmtl")) { // Hit a new material
                this.materials.push(currentMaterial);
                currentMaterial = new Material(line.split(" ")[1]);
            }
            else if (line.startsWith("Ka")) { // Material ambient definition
                var values = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                currentMaterial.ambient = vec3(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]));
            }
            else if (line.startsWith("Kd")) { // Material diffuse definition
                var values = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                currentMaterial.diffuse = vec3(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]));
            }
            else if (line.startsWith("Ks")) { // Material specular definition
                var values = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                currentMaterial.specular = vec3(parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[2]));
            }
            else if (line.startsWith("Ns")) { // Material shininess definition
                var values = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                currentMaterial.shininess = parseFloat(values[0]);
            }
            else if (line.startsWith("map_Kd")) { // Material diffuse texture definition
                currentMaterial.diffuseMap = line.split(" ")[1];
            } else if (line.startsWith("map_Ks")) { // Material specular texture definition
                currentMaterial.specularMap = line.split(" ")[1];
            } else if (line.startsWith("map_bump")) { // Material bump texture definition
                currentMaterial.bumpMap = line.split(" ")[1];
            }
        }
        this.materials.push(currentMaterial);

        // Remove the null material
        this.materials.shift();
    }
    
    parseOBJFile(objLines, currLine) {
        var currentMaterialGroupIndex;
        for (; currLine < objLines.length; currLine++) {
            var line = objLines[currLine];

            if (line.charAt(0) === 'v') { // Vertex position definition
                var coords = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                this.vertices.push(vec4(parseFloat(coords[0]), parseFloat(coords[1]), parseFloat(coords[2]), 1.0));
            } else if (line.startsWith("vt")) { // Vertex UV definition
                var coords = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                this.uvs.push(vec2(parseFloat(coords[0]), 1.0 - parseFloat(coords[1])));
            } else if (line.startsWith("vn")) { // Vertex normal definition
                var coords = line.match(/[+-]?([0-9]+[.])?[0-9]+/g);
                this.normals.push(vec4(parseFloat(coords[0]), parseFloat(coords[1]), parseFloat(coords[2]), 0.0));
            } else if (line.startsWith("usemtl")) { // Material use definition
                var materialName = line.split(" ")[1];
                var material = this.getMaterial(materialName);
                this.materialGroups.push(new MaterialGroup(material));
                currentMaterialGroupIndex = this.materialGroups.length - 1;
            } else if (line.charAt(0) === 'f') {
                var currentMaterialGroup = this.materialGroups[currentMaterialGroupIndex];
                var faceVertexIndices = [];
                var faceUVIndices = [];
                var faceNormalIndices = [];

                var face = line.split(" ");
                for (var i = 1; i < face.length; i++) {
                    // Extract the v/vt/vn statements into an array
                    var indices = line.match(/[0-9\/]+/g);
                    console.log(indices);

                    // Account for how vt/vn can be omitted
                    var types = indices[0].match(/[\/]/g).length;

                    if (types === 0) { // Only v provided
                        throw new Error("Vertex normals and UV coordinates are required.");
                    }
                    else if (types === 1) { // v and vt provided
                        throw new Error("Vertex normals are required.");
                    }
                    else if (types === 2) { // v, maybe vt, and vn provided
                        var slashIndex = indices[0].indexOf('/');
                        if (indices[0].charAt(slashIndex + 1) === '/') { // vt omitted
                            throw new Error("Vertex UV coordinates are required.");
                        } else { // vt provided
                            indices.forEach(value => {
                                var firstSlashIndex = value.indexOf('/');
                                var secondSlashIndex = value.indexOf('/', firstSlashIndex + 1);

                                // get the vertex
                                var vertexIndex = parseInt(value) - 1;
                                var vertex = this.vertices[vertexIndex];

                                // if vertex is already in the list of vertices in the current material group, use that vertex
                                // otherwise, add the vertex to the list of vertices in the current material group
                                vertexIndex = currentMaterialGroup.vertices.indexOf(vertex);
                                if (vertexIndex === -1) {
                                    currentMaterialGroup.addVertex(vertex);
                                    vertexIndex = currentMaterialGroup.vertices.length - 1;
                                }

                                // add the vertex index to the face's vertex indices
                                faceVertexIndices.push(vertexIndex);

                                // get the uv
                                var uvIndex = parseInt(value.substring(firstSlashIndex + 1)) - 1;
                                var uv = this.uvs[uvIndex];

                                // if uv is already in the list of uvs in the current material group, use that uv
                                // otherwise, add the uv to the list of uvs in the current material group
                                uvIndex = currentMaterialGroup.uvs.indexOf(uv);
                                if (uvIndex === -1) {
                                    currentMaterialGroup.addUV(uv);
                                    uvIndex = currentMaterialGroup.uvs.length - 1;
                                }

                                // add the uv index to the face's uv indices
                                faceUVIndices.push(uvIndex);

                                // get the normal
                                var normalIndex = parseInt(value.substring(secondSlashIndex + 1)) - 1;
                                var normal = this.normals[normalIndex];

                                // if normal is already in the list of normals in the current material group, use that normal
                                // otherwise, add the normal to the list of normals in the current material group
                                normalIndex = currentMaterialGroup.normals.indexOf(normal);
                                if (normalIndex === -1) {
                                    currentMaterialGroup.addNormal(normal);
                                    normalIndex = currentMaterialGroup.normals.length - 1;
                                }

                                // add the normal index to the face's normal indices
                                faceNormalIndices.push(normalIndex);

                                // add the face to the current material group
                                currentMaterialGroup.addFace(new Face(faceVertexIndices, faceNormalIndices, faceUVIndices));
                            });
                        }
                    }
                }
            }
        }
    }
}