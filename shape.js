function slope(vertices, points, normals, uv) {
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

//given a 2D matrix of rows comprising vec2 of texture coordinates, transform each vec2 to be rotated by theta
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

function toRadians(theta) {
	return theta*Math.PI/180;
}

function Cube(vertices, points, normals, uv){
    Quad(vertices, points, normals, uv, 0, 1, 2, 3, vec3(0, 0, 1));
    Quad(vertices, points, normals, uv, 4, 0, 6, 2, vec3(0, 1, 0));
    Quad(vertices, points, normals, uv, 4, 5, 0, 1, vec3(1, 0, 0));
    Quad(vertices, points, normals, uv, 2, 3, 6, 7, vec3(1, 0, 1));
    Quad(vertices, points, normals, uv, 6, 7, 4, 5, vec3(0, 1, 1));
    Quad(vertices, points, normals, uv, 1, 5, 3, 7, vec3(1, 1, 0 ));
}

function Quad(vertices, points, normals, uv, v1, v2, v3, v4, normal) {

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

//functions for creating sphere data (points and normals)
function tetrahedron(a, b, c, d, n, points, normals) {
	divideTriangle(a, b, c, n, points, normals);
	divideTriangle(d, c, b, n, points, normals);
	divideTriangle(a, d, b, n, points, normals);
	divideTriangle(a, c, d, n, points, normals);
}

function divideTriangle(a, b, c, count, points, normals) {
	if ( count > 0 ) {
		var ab = mix(a, b, 0.5);
		var ac = mix(a, c, 0.5);
		var bc = mix(b, c, 0.5);
		
		ab = normalize(ab, true);
		ac = normalize(ac, true);
		bc = normalize(bc, true);
		
		divideTriangle(a, ab, ac, count-1, points, normals);
		divideTriangle(ab, b, bc, count-1, points, normals);
		divideTriangle(bc, c, ac, count-1, points, normals);
		divideTriangle(ab, bc, ac, count-1, points, normals);
	}
	else { 
		triangle(a, b, c, points, normals);
	}
}

function triangle(a, b, c, points, normals) {

	points.push(a);
	points.push(b);
	points.push(c);
	
	// smooth shading
	normals.push(a);
	normals.push(b);
	normals.push(c);

	sphereIndex += 3;
	
}

