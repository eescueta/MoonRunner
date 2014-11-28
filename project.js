/*
 * @author: Nathan Tung
 * @comments: 
 * 
 */

// global components
var canvas;
var gl;
var length = 0.5;
var time = 0.0;
var timer = new Timer();

// navigation system variables
var x = 0; // x-axis displacement from origin (controls right/left)
var y = 0; // y-axis displacement from origin (controls up/down)
var z = 0; // z-axis displacement from origin (controls back/forward)

// buffers for vertices and normals
var positionBuffer;
var normalBuffer;
var uvBuffer;

// view transformation matrices
var uniform_mvpMatrix;
var viewMatrix;
var projectionMatrix;
var mvpMatrix;

// light position and attribute data
var attribute_position;
var attribute_normal;
var uniform_lightPosition;
var uniform_shininess;
var uniform_sampler;

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);

// slope arrays
var pointsArray = [];
var normalsArray = [];
var uvArray = [];
var index = 0;

// texture
var texture;

// view matrix
var eye = vec3(0, 1, 2);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

window.onload = function init() {

	// initialize canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	document.onkeydown = function(e) {
		e = e || window.event;
		
		// user can move camera foward or back using "i" and "o"
		// furthermore, the user can move the camera left/right and up/down using arrow keys
		
		if(e.keyCode===73) { // "i" (move camera forward)
			z+=0.05;
			if(z>2) z=0;
		}
		else if(e.keyCode===79) { // "o" (move camera back)
			z-=0.05;
		}
		else if(e.keyCode===38) { // "up" (move camera up)
			y-=0.1;
		}
		else if( e.keyCode===40) { // "down" (move camera down)
			y+=0.1;
		}
		else if(e.keyCode===37) { // "left" (move camera left)
			x+=0.1;
		}
		else if(e.keyCode===39) { // "right" (move camera right)
			x-=0.1;
		}
		else if(e.keyCode===27) { // "esc" resets the camera to original position
			x=0;
			y=0;
			z=0;
		}
	};
	
	// set up world, specifying the viewport, enabling depth buffer, and clearing color buffer
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	
	// use program with shaders
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	// loading a texture image into buffer for texture mapping
	// set up texture image using nearest neighbor filtering
	texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
    }
	texture.image.src = "./Images/snow.jpg";

	slopeVertices = [
		vec3(length, 0, length),
		vec3(length, 0, -length),
		vec3(-length, 0, -length),
		vec3(-length, 0, length)
	];
	
	// generate slope arrays
    slope(slopeVertices, pointsArray, normalsArray, uvArray);	
    
	// bind and set up position buffer
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
	// bind and set up normal buffer
	normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	
	// bind and set up texture coordinate buffer
	uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);
	
// enable bound shader position/normal attributes
	
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);

    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
	
	attribute_UV = gl.getAttribLocation(program, "vTextureCoordinates");
    gl.enableVertexAttribArray(attribute_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	
	
	// set variables for all the other uniform variables in shader
    uniform_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    uniform_pMatrix = gl.getUniformLocation(program, "pMatrix");
    uniform_lightPosition = gl.getUniformLocation(program, "lightPosition");
    uniform_shininess = gl.getUniformLocation(program, "shininess");
	uniform_sampler = gl.getUniformLocation(program, "uSampler");
	
	// set camera position and perspective such that both cubes are in view
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);

	// set light position
	mvLightMatrix = viewMatrix;
	uniform_mvLightMatrix = gl.getUniformLocation(program, "mvLightMatrix");
	gl.uniformMatrix4fv(uniform_mvLightMatrix, false, flatten(mvLightMatrix));
	
	// reset timer and enable depth buffer before rendering
    timer.reset();	
    gl.enable(gl.DEPTH_TEST);
	
    render();
}

function render() {
	
	// testing skid movement
	// or alternatively scroll the texture!
	z+=0.02;
	if(z>2) z=0;
	
	// clear buffers and update time based on timer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    time += timer.getElapsedTime() / 1000;
	
	viewMatrix = lookAt(eye, at, up);

	// set projection matrix
	gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));
	
	// set light position
	gl.uniform3fv(uniform_lightPosition,  flatten(lightPosition));
    gl.uniform1f(uniform_shininess,  shininess);
	
// slope

	// bind the normal texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);

	// set up model-view matrix and bind
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, translate(vec3(x,y,z)));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0.9, 0)));
	mvMatrix = mult(mvMatrix, scale(vec3(5, 5, 5)));
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
	
	// bind to first texture (normal, nearest neighbor)
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform_sampler, 0)

	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
    window.requestAnimFrame(render);
}

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