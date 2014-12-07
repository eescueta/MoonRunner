/*
 * @author: Nathan Tung
 * @comments: 
 * 
 */

window.onload = init;

// initializes all data (canvas, program, objects, textures, etc.) and loads game world
// this function should only be called once at the very beginning upon the window loading
function init() {
	
	setupWorld();
	loadWorld();
	
}

// generate all data (canvas, program, objects, textures, etc.) and stores in variables for future use
function setupWorld() {
	
	// initialize canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
	// set up event listener on the keyboard for color cycling, toggling crosshair, navigating, and resetting
	initEventListener();
	
	// set up world, specifying the viewport, enabling depth buffer, and clearing color buffer
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	
	// use program with shaders
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // enable bound shader position/normal attributes

    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);

    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
	
	attribute_UV = gl.getAttribLocation(program, "vTextureCoordinates");
    gl.enableVertexAttribArray(attribute_UV);

	// set variables for all the other uniform variables in shader
    uniform_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    uniform_pMatrix = gl.getUniformLocation(program, "pMatrix");
    uniform_lightPosition = gl.getUniformLocation(program, "lightPosition");
    uniform_shininess = gl.getUniformLocation(program, "shininess");
	uniform_sampler = gl.getUniformLocation(program, "uSampler");
	
	// generate textures;
    initTextures();
	
	groundVertices = [
		vec3(length, 0, length),
		vec3(length, 0, -length),
		vec3(-length, 0, -length),
		vec3(-length, 0, length)
	];
	
    // generate sphere data
    setupSphere();
	
	// generate ground data
    ground(groundVertices, pointsArray, normalsArray, uvArray);	

    // generate block data
    Cube(vertices, cubePoints, cubeNormals, cubeUv);
    

	// set camera position and perspective such that both cubes are in view
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);

	// set light position
	mvLightMatrix = viewMatrix;
	uniform_mvLightMatrix = gl.getUniformLocation(program, "mvLightMatrix");
	gl.uniformMatrix4fv(uniform_mvLightMatrix, false, flatten(mvLightMatrix));
    
}

// reset positioning and player progress, then render world (call this function to reset after player loses)
function loadWorld() {
    
	// reset variables
	score = 0;
	life = 3;
	textureDegree = 0;
	textureScrollSpeed = 0.005;

    // reset block positions
    for (var i = 0; i < 10; i++)
    {
    	positionX[i] = Math.floor(Math.random()*4) + 0;
    	positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
    	positionZ[i] = Math.floor(Math.random()*10) + 6;
    	positionZ[i] *= -1;
    }
    positionX[0] = 0;
    positionZ[0] = -7;

	// reset timer and enable depth buffer before rendering
    timer.reset();	
    gl.enable(gl.DEPTH_TEST);
    
    render();
}

function render() {
	
	if (!gamestart) {
		$( ".interface" ).html("<img src='./Images/start.png'>");
		return;
	}
	
	if(life<=0) {
		$( ".interface" ).html("<img src='./Images/gameover.png'>");
		return;
	}
	
	// clear buffers and update time based on timer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    time += timer.getElapsedTime() / 1000;
    // scrollZ += 0.01;
    if (life > 0)
    {
    	score += 1;
    	invincibility++;
    }

    $('#score').html(score);
	
	viewMatrix = lookAt(eye, at, up);

	// set projection matrix
	gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));
	
	// set light position
	gl.uniform3fv(uniform_lightPosition, flatten(lightPosition));
    gl.uniform1f(uniform_shininess, shininess);

    // Ground

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	
    
    // scrolling of texture
    // apply relative translational positioning to uvArray (x and y components are additively increased by those values on each render)
    var translateX = textureScrollSpeed*Math.cos(toRadians(textureDegree));
    var translateY = -textureScrollSpeed*Math.sin(toRadians(textureDegree));
    translateUV(uvArray, translateX, translateY);
	// apply transformation via binding
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArray), gl.STATIC_DRAW);

    // rotation of texture
	var uvArrayTemp = uvArray.slice(); // make a copy of uvArray
	// apply absolute rotational positioning to copy of uvArray (x and y components of uvArrayTemp are calculated anew each time, from 0 degrees to time*360 degrees)
	rotateUV(uvArrayTemp, textureDegree);
	// apply transformation via binding
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(uvArrayTemp), gl.STATIC_DRAW);

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
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.uniform1i(uniform_sampler, 0)

	gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Outer Space
    
	positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_position);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_normal);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	
    
    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeUv), gl.STATIC_DRAW);
    
    gl.enableVertexAttribArray(attribute_UV);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	
	
    mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, rotate(textureDegree,vec3(0, 1, 0)));
	mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 1.5, 0)));
	mvMatrix = mult(mvMatrix, rotate(time*0.75,vec3(1, 0, 0))); // TODO: sync rotation speed here with skid speed
	mvMatrix = mult(mvMatrix, scale(vec3(20, 20, 20)));
	gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, spaceTexture);
    gl.uniform1i(uniform_sampler, 0)
	
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    
    // Planet

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, planetTexture);
	gl.uniform1i(uniform_sampler, 0)
	
    gl.bindBuffer(gl.ARRAY_BUFFER, planetPoints);
    gl.vertexAttribPointer(attribute_position, planetPoints.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetUv);
    gl.vertexAttribPointer(attribute_UV, planetUv.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetNormals);
    gl.vertexAttribPointer(attribute_normal, planetNormals.itemSize, gl.FLOAT, false, 0, 0);

	// set model view matrix for planet
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, rotate(textureDegree,vec3(0, 1, 0)));
	mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
	mvMatrix = mult(mvMatrix, translate(vec3(5, 0, 0)));
	mvMatrix = mult(mvMatrix, rotate(time * 3, [ 1, 0, 0 ]));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, -10)));
	mvMatrix = mult(mvMatrix, rotate(time * 50, [ 0, 1, 0 ]));
	mvMatrix = mult(mvMatrix, scale(vec3(0.5, 0.5, .5)));
	gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetIndexBuffer);
    gl.drawElements(gl.TRIANGLES, planetIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    
	//Blocks

	positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_position);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_normal);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeUv), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_UV);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	

	for(var i = 0; i < 10; i++)
	{
		positionZ[i] += textureScrollSpeed; // positionZ[i] += 0.01;
		mvMatrix = viewMatrix;
		mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
		mvMatrix = mult(mvMatrix, translate(vec3(positionX[i] + scrollX, 1, positionZ[i])));
		mvMatrix = mult(mvMatrix, rotate(textureDegree, (vec3(0, 1, 0))));
		
		
		if (-0.15 < (positionX[i] + scrollX) && (positionX[i] + scrollX) < 0.15)
		{
			if (-0.005 < (positionZ[i]) && (positionZ[i]) < 0.005+textureScrollSpeed)
			{
				if (life > 0 && invincibility > 60)
				{
					life--;
					invincibility = 0;
					
					// play up to three "smash" audio files at the same time 
					if(smash1.currentTime==0)
						smash1.play();
					else if(smash2.currentTime==0)
						smash2.play();
					else
						smash3.play()
					;
				}
			}
		} 
		mvMatrix = mult(mvMatrix, scale(vec3(0.25, 0.5, 0.05)));
   		gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));

   		gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, debrisTexture);
	    gl.uniform1i(uniform_sampler, 0)
	    
		if (positionZ[i] > 1.5) {
			positionX[i] = Math.floor(Math.random()*4) + 0;
			positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			positionZ[i] = -7;
		}
	    
	    if (positionZ[i] > -5) {
			gl.drawArrays(gl.TRIANGLES, 0, 36);
		}
	}


    // Life HUD
	
	positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_position);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_normal);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeUv), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribute_UV);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, heartTexture);
    gl.uniform1i(uniform_sampler, 0)

    for (var i = 0; i < life; i++) {
	    orthoProjectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	    mvMatrix = orthoProjectionMatrix;
	    mvMatrix = mult(mvMatrix, scale(vec3(0.1, 0.1, 1)));
	    // mvMatrix = mult(mvMatrix, translate(vec3(-4.5, 4.5, 0)));
	    mvMatrix = mult(mvMatrix, translate(heartPositions[i]));
	    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    	gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    window.requestAnimFrame(render);
}
