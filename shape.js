
// generate plane data
function ground(vertices, points, normals, uv) {
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	normals.push(vec3(0, 1, 0));
	
    uv.push(vec2(0,0));
    uv.push(vec2(1,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,1));
    
    points.push(vertices[0]);
    points.push(vertices[1]);
    points.push(vertices[2]);
    points.push(vertices[0]);
    points.push(vertices[2]);
    points.push(vertices[3]);
}

// given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be rotated by theta
function rotateUV(matrix, theta) {

	var rad = theta*Math.PI/180;

	for(var i=0; i<matrix.length; i++) {
		var tempX = matrix[i][0];
		var tempY = matrix[i][1];
		
		// texture rotates at an axis located at the corner of the cube
		// we need to translate the texture coordinates there first (a diagonal of 0.5 units, as it's a unit cube)
		tempX = tempX-0.5;
		tempY = tempY-0.5;
		
		// apply the rotation
		var newX = tempX*Math.cos(rad) + tempY*Math.sin(rad);
		var newY = -tempX*Math.sin(rad) + tempY*Math.cos(rad);
		
		// then translate texture back to original position
		newX = newX+0.5;
		newY = newY+0.5;
		
		// make changes to the matrix
		matrix[i] = [newX, newY];
	}
}

// given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be translated by distance (separated by x and y components)
function translateUV(matrix, distanceX, distanceY) {
		for(var i=0; i<matrix.length; i++) {
		// take x and y components of the vec2 and translate them
		var newX = matrix[i][0]+distanceX;
		var newY = matrix[i][1]+distanceY;
		
		// make changes to the matrix
		matrix[i] = [newX, newY];
	}
}

// convert degrees to radians
function toRadians(theta) {
	return theta*Math.PI/180;
}

// generate cube data
function cube(vertices, points, normals, uv){
    quad(vertices, points, normals, uv, 0, 1, 2, 3, vec3(0, 0, 1));
    quad(vertices, points, normals, uv, 4, 0, 6, 2, vec3(0, 1, 0));
    quad(vertices, points, normals, uv, 4, 5, 0, 1, vec3(1, 0, 0));
    quad(vertices, points, normals, uv, 2, 3, 6, 7, vec3(1, 0, 1));
    quad(vertices, points, normals, uv, 6, 7, 4, 5, vec3(0, 1, 1));
    quad(vertices, points, normals, uv, 1, 5, 3, 7, vec3(1, 1, 0 ));
}


// cube helper function
function quad(vertices, points, normals, uv, v1, v2, v3, v4, normal) {

    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    uv.push(vec2(0,0));
    uv.push(vec2(1,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,0));
    uv.push(vec2(1,1));
    uv.push(vec2(0,1));

    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}

// generate sphere data
// based on the Learning WebGL Tutorial (http://learningwebgl.com/blog/?p=1253)
function setupSphere() {
    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    planetIndexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            planetIndexData.push(first);
            planetIndexData.push(second);
            planetIndexData.push(first + 1);

            planetIndexData.push(second);
            planetIndexData.push(second + 1);
            planetIndexData.push(first + 1);
        }
    }

    planetNormals = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetNormals);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    planetNormals.itemSize = 3;
    planetNormals.numItems = normalData.length / 3;

    planetUv = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetUv);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    planetUv.itemSize = 2;
    planetUv.numItems = textureCoordData.length / 2;

    planetPoints = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetPoints);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    planetPoints.itemSize = 3;
    planetPoints.numItems = vertexPositionData.length / 3;

    planetIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(planetIndexData), gl.STATIC_DRAW);
    planetIndexBuffer.itemSize = 1;
    planetIndexBuffer.numItems = planetIndexData.length;
}