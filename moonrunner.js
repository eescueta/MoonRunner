/*
 * @author: Nathan Tung
 * @comments: 
 * 
 */

// initializes all data (canvas, program, objects, textures, etc.) and loads game world
// this function should only be called once at the very beginning upon the window loading
window.onload = init;
function init() {
	setupWorld();
	loadWorld();
}

// decrement the captionTimer variable by x milliseconds every x milliseconds
// optimize x to be some chunk which retains precision but does not waste resources
window.setInterval(function() { if(captionTimer>0) captionTimer-=100; }, 100);

// generate all data (canvas, program, objects, textures, etc.) and stores in variables for future use
// this function should only be called once when the window loads in the function init()
function setupWorld() {
	
	// initialize canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
	// set up event listener on the keyboard
	initEventListener();
	
	// set up world (viewport, enabling death buffer, clearing color buffer)
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
	
	// associate program with WebGl canvas
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // enable bound program attributes (position/points)
    attribute_position = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(attribute_position);

    // enable bound program attributes (normals)
    attribute_normal = gl.getAttribLocation(program, "vNormal");
    gl.enableVertexAttribArray(attribute_normal);
	
    // enable bound program attributes (uv/texture coordinates)
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
	
    // generate sphere data
    setupSphere();
	
	// generate ground data
    ground(groundVertices, planePoints, planeNormals, planeUv);	

    // generate block data
    cube(cubeVertices, cubePoints, cubeNormals, cubeUv);
    
	// set camera position and perspective such that both cubes are in view
    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);

	// set light position
	mvLightMatrix = viewMatrix;
	uniform_mvLightMatrix = gl.getUniformLocation(program, "mvLightMatrix");
	gl.uniformMatrix4fv(uniform_mvLightMatrix, false, flatten(mvLightMatrix));
    
}

// reset positioning and player progress, then render world
// call this function each time for resetting after player loses
function loadWorld() {
    
	// reset game variables for player progress
	score = 0;
	life = 3;
	textureDegree = 0;
	textureScrollSpeed = 0.005;
	previouslyHit = false;

    // reset debris positions
	setObjectPositions(debris_positionX, debris_positionZ, NUM_DEBRIS);
    
    // reset health positions
	setObjectPositions(health_positionX, health_positionZ, NUM_HEALTH);
    
    // reset flag positions
	setObjectPositions(flag_positionX, flag_positionZ, NUM_FLAG);
	
    // reset slow positions
	setObjectPositions(slow_positionX, slow_positionZ, NUM_SLOW);

	// reset timer and enable depth buffer before rendering
    timer.reset();
    gl.enable(gl.DEPTH_TEST);
    
    // render!
    render();
}

function render() {
	
	// if caption timer has run out, set caption to nothing
	if(captionTimer<=0) {
		setCaption("");
	}

	// increment player speed on each frame
	textureScrollSpeed+=0.0001;
	
	// if game has not started, show start screen and return from rendering
	if (!gamestart) {
		$( ".interface" ).html("<img src='./Images/start.png'>");
		return;
	}
	
	// if life is 0, show game over screen, return from rendering, and allow player to reset game
	if(life<=0) {
		setCaption("Your Score: " + score);
		$( ".interface" ).html("<img src='./Images/gameover.png'>");
		RESET_READY = true;
		return;
	}
	
	// clear buffers and update time based on timer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    time += timer.getElapsedTime() / 1000;
    
    // if player is still alive, increment score and invincibility frame count
    if (life > 0) {
    	score += 1;
    	invincibility++;
    	turnInterval++;
    	if (turnInterval > 15)
    	{
			$(".wheel").rotate({ animateTo:0});
    	}
    }
    
    // if user is currently invincible, flash the canvas' border between two provided colors
    if(previouslyHit && invincibility <= invincibilityPeriod) {
        if($("#canvas-wrap").css("border-top-color")===BORDER_COLOR_INVINCIBLE)
        	$("#canvas-wrap").css("border-color", BORDER_COLOR_NORMAL);
        else
        	$("#canvas-wrap").css("border-color", BORDER_COLOR_INVINCIBLE);
    }
    else {
    	$("#canvas-wrap").css("border-color", BORDER_COLOR_NORMAL);
    }
    
    // update score display
    $('#score').html(score);
	
	// set projection matrix
	gl.uniformMatrix4fv(uniform_pMatrix, false, flatten(projectionMatrix));
	
	// set light position
	gl.uniform3fv(uniform_lightPosition, flatten(lightPosition));
    gl.uniform1f(uniform_shininess, shininess);

// BEGIN: RENDER GROUND
    // use plane data and set texture
    switchToPlaneBuffers();
    setTexture(groundTexture);
    
    // scroll texture using relative translation, where x, y components are additively incremented
    var translateX = textureScrollSpeed/5*Math.cos(toRadians(textureDegree));
    var translateY = -textureScrollSpeed/5*Math.sin(toRadians(textureDegree));
    translateUV(planeUv, translateX, translateY);

    // rotate texture with absolute rotation, where x, y components of temporary uv buffer are rendered from 0 degrees to time*degree
	var planeUvTemp = planeUv.slice(); // make a copy of the actual uv buffer (planeUv)
	rotateUV(planeUvTemp, textureDegree);

	// bind buffers to apply texture scrolling/rotation 
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(planeUvTemp), gl.STATIC_DRAW);

	// set up model-view matrix and bind
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, translate(vec3(x,y,z)));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0.9, 0)));
	mvMatrix = mult(mvMatrix, scale(vec3(15, 15, 15)));
    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));

    // draw actual shapes
	gl.drawArrays(gl.TRIANGLES, 0, 6);
// END: RENDER GROUND

// BEGIN: RENDER OUTER SPACE
	// use cube data and set texture
    switchToCubeBuffers();
	setTexture(spaceTexture);
	
	// set up model-view matrix and bind
    mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, rotate(textureDegree,vec3(0, 1, 0)));
	mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 1.5, 0)));
	mvMatrix = mult(mvMatrix, rotate(time*0.75,vec3(1, 0, 0)));
	mvMatrix = mult(mvMatrix, scale(vec3(20, 20, 20)));
	gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));

	// draw actual shapes
	gl.drawArrays(gl.TRIANGLES, 0, 36);
// END: RENDER OUTER SPACE
    
// BEGIN: RENDER EARTH
	// use sphere data and set texture
	switchToSphereBuffers();
	setTexture(planetTexture);

	// set up model-view matrix and bind
	mvMatrix = viewMatrix;
	mvMatrix = mult(mvMatrix, rotate(textureDegree,vec3(0, 1, 0)));
	mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
	mvMatrix = mult(mvMatrix, translate(vec3(5, 0, 0)));
	mvMatrix = mult(mvMatrix, rotate(time * 3, [ 1, 0, 0 ]));
	mvMatrix = mult(mvMatrix, translate(vec3(0, 0, -10)));
	mvMatrix = mult(mvMatrix, rotate(time * 50, [ 0, 1, 0 ]));
	mvMatrix = mult(mvMatrix, scale(vec3(0.5, 0.5, .5)));
	gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    
	// draw actual shapes (alternate method for spheres)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetIndexBuffer);
    gl.drawElements(gl.TRIANGLES, planetIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
// END: RENDER EARTH

// BEGIN: RENDER DEBRIS
    // use sphere data and set texture
    setTexture(debrisTexture);
    
    // for each object
	for(var i = 0; i < NUM_DEBRIS; i++)
	{
		// set object to move with ground
		debris_positionZ[i] += textureScrollSpeed;
		
		// set up model-view matrix and bind
		mvMatrix = viewMatrix;
		mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
		mvMatrix = mult(mvMatrix, translate(vec3(debris_positionX[i] + scrollX, 1, debris_positionZ[i])));
		mvMatrix = mult(mvMatrix, rotate(textureDegree, (vec3(0, 1, 0))));
		mvMatrix = mult(mvMatrix, scale(vec3(0.075, 0.09, 0.05)));
   		gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));

   		// if player hits object, subtract life count, reset invincibility frames and play sound
		if (-0.15 < (debris_positionX[i] + scrollX) && (debris_positionX[i] + scrollX) < 0.15) {
			if (-0.005 < (debris_positionZ[i]) && (debris_positionZ[i]) < 0.005+textureScrollSpeed) {
				if (life > 0 && invincibility > invincibilityPeriod) {
					life--;
					invincibility = 0;
					previouslyHit = true;
					setCaption("Ouch! You're temporarily invincible!");
					playAudio("./Sounds/smash.wav");
				}
			}
		} 
		
		// if object goes out of view, reset its positioning
		if (debris_positionZ[i] > 1.5) {
			debris_positionX[i] = Math.floor(Math.random()*4) + Math.random();
			debris_positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			debris_positionZ[i] = -7;
		}
	    
		// draw object if within view
	    if (debris_positionZ[i] > -5) {
	        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planetIndexBuffer);
	        gl.drawElements(gl.TRIANGLES, planetIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			
		}
	}
// END: RENDER DEBRIS
	
	// switch to cube data used by all the other objects
	switchToCubeBuffers();
	
// BEGIN: RENDER HEALTH PACKS
	// use cube data and set texture
	setTexture(healthTexture);
	
	// for each object
	for(var i = 0; i < NUM_HEALTH; i++) {	
		// set object to move with ground
		health_positionZ[i] += textureScrollSpeed;
		
		// set up model-view matrix and bind
		mvMatrix = viewMatrix;
		mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
		mvMatrix = mult(mvMatrix, translate(vec3(health_positionX[i] + scrollX, 1, health_positionZ[i])));
		mvMatrix = mult(mvMatrix, rotate(textureDegree, (vec3(0, 1, 0))));
		mvMatrix = mult(mvMatrix, scale(vec3(0.2, 0.25, 0.05)));
   		gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
		
   		// if player hits object and has fewer than the max number of hearts, increment life count and play sound
		if (-0.15 < (health_positionX[i] + scrollX) && (health_positionX[i] + scrollX) < 0.15) {
			if (-0.005 < (health_positionZ[i]) && (health_positionZ[i]) < 0.005+textureScrollSpeed) {
				if(life < MAX_TOTAL_HEALTH) {
					life++;
					setCaption("Health +1");
				}
				playAudio("./Sounds/health.wav");
			}
		} 

		// if object goes out of view, reset its positioning
		if (health_positionZ[i] > 1.5) {
			health_positionX[i] = Math.floor(Math.random()*4) + Math.random();
			health_positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			health_positionZ[i] = -7;
		}
		
		// draw object if within view
	    if (health_positionZ[i] > -5)
			gl.drawArrays(gl.TRIANGLES, 0, 36);
	}
// END: RENDER HEALTH PACKS

// BEGIN: RENDER FLAGS
	// use cube data and set texture
	setTexture(flagTexture);
	
	// for each object
	for(var i = 0; i < NUM_FLAG; i++) {
		// set object to move with ground
		flag_positionZ[i] += textureScrollSpeed;
		
		// set up model-view matrix and bind
		mvMatrix = viewMatrix;
		mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
		mvMatrix = mult(mvMatrix, translate(vec3(flag_positionX[i] + scrollX, 1, flag_positionZ[i])));
		mvMatrix = mult(mvMatrix, rotate(textureDegree, (vec3(0, 1, 0))));
		mvMatrix = mult(mvMatrix, scale(vec3(0.25, 0.25, 0.001)));
   		gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));		
		
   		// if player hits object add points to score count and play sound
		if (-0.15 < (flag_positionX[i] + scrollX) && (flag_positionX[i] + scrollX) < 0.15) {
			if (-0.005 < (flag_positionZ[i]) && (flag_positionZ[i]) < 0.005+textureScrollSpeed) {
				score += FLAG_NUM_POINTS;
				setCaption("Score +"+FLAG_NUM_POINTS);
				playAudio("./Sounds/flag.wav");
			}
		} 

		// if object goes out of view, reset its positioning
		if (flag_positionZ[i] > 1.5) {
			flag_positionX[i] = Math.floor(Math.random()*4) + Math.random();
			flag_positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			flag_positionZ[i] = -7;
		}

		// draw object if within view
	    if (flag_positionZ[i] > -5)
			gl.drawArrays(gl.TRIANGLES, 0, 36);
	}
	
// END: RENDER FLAGS

// BEGIN: RENDER "SLOW" SIGNS
	// use cube data and set texture
	setTexture(slowTexture);
	
	// for each object
	for(var i = 0; i < NUM_SLOW; i++) {
		// set object to move with ground
		slow_positionZ[i] += textureScrollSpeed;

		// set up model-view matrix and bind
		mvMatrix = viewMatrix;
		mvMatrix = mult(mvMatrix, translate(vec3(x, y, z)));
		mvMatrix = mult(mvMatrix, translate(vec3(slow_positionX[i] + scrollX, 1, slow_positionZ[i])));
		mvMatrix = mult(mvMatrix, rotate(textureDegree, (vec3(0, 1, 0))));
		mvMatrix = mult(mvMatrix, scale(vec3(0.2, 0.25, 0.001)));
   		gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));		
		
   		// if player hits object, cut movement speed in half and play sound
		if (-0.15 < (slow_positionX[i] + scrollX) && (slow_positionX[i] + scrollX) < 0.15) {
			if (-0.005 < (slow_positionZ[i]) && (slow_positionZ[i]) < 0.005+textureScrollSpeed) {
				textureScrollSpeed/=2;
				setCaption("Speed halved!");
				playAudio("./Sounds/slow.wav");
			}
		} 
	    
		// if object goes out of view, reset its positioning
		if (slow_positionZ[i] > 1.5) {
			slow_positionX[i] = Math.floor(Math.random()*4) + Math.random();
			slow_positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			slow_positionZ[i] = -7;
		}
	    
		// draw object if within view
	    if (slow_positionZ[i] > -5)
			gl.drawArrays(gl.TRIANGLES, 0, 36);
	}
// END: RENDER "SLOW" SIGNS
	
// BEGIN: RENDER LIFE BAR HUD
	// use cube data and set texture
	setTexture(heartTexture);

	// for each heart, set up orthographic projection and model-view matrix and bind/draw
    for (var i = 0; i < life; i++) {
    	orthoProjectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	    mvMatrix = orthoProjectionMatrix;
	    mvMatrix = mult(mvMatrix, scale(vec3(0.1, 0.1, 1)));
	    mvMatrix = mult(mvMatrix, translate(heartPositions[i]));
	    gl.uniformMatrix4fv(uniform_mvMatrix, false, flatten(mvMatrix));
    	gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
// END: RENDER LIFE BAR HUD
    
    window.requestAnimFrame(render);
}

// given a set of positionX and positionZ arrays and number of some object, assign each object random positions
function setObjectPositions(positionX, positionZ, num) {
    for (var i = 0; i < num; i++) {
    	positionX[i] = Math.floor(Math.random()*4) + Math.random();
    	positionX[i] *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
    	positionZ[i] = Math.floor(Math.random()*10) + 6;
    	positionZ[i] *= -1;
    }
}

// play audio file found with given file path
function playAudio(path) {
	(new Audio(path)).play();
}

// generate a random decimal number between a and b
function randomNumber(a, b) {
	return Math.random()*(b-a)+a;
}

// set text to show up on canvas screen as caption, then update captionTimer
function setCaption(text) {
	$("#caption").html(text);
	if(text!=="")
		captionTimer = CAPTION_TIME_LENGTH;
}

// set specified texture and bind
function setTexture(texture) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniform_sampler, 0)
}

// bind to buffers with plane data
function switchToPlaneBuffers() {
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planePoints), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute_position, 3, gl.FLOAT, false, 0, 0);

    normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planeNormals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute_normal, 3, gl.FLOAT, false, 0, 0);	

    uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planeUv), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);	
    
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);
}

// bind to buffers with cube data
function switchToCubeBuffers() {
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
    
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(attribute_UV, 2, gl.FLOAT, false, 0, 0);
}

// bind to buffers with sphere data
function switchToSphereBuffers() {
    gl.bindBuffer(gl.ARRAY_BUFFER, planetPoints);
    gl.vertexAttribPointer(attribute_position, planetPoints.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, planetNormals);
    gl.vertexAttribPointer(attribute_normal, planetNormals.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, planetUv);
    gl.vertexAttribPointer(attribute_UV, planetUv.itemSize, gl.FLOAT, false, 0, 0);
}