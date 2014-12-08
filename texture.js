
// set up texture variables
function initTextures() {

	// Ground Texture
	groundTexture = gl.createTexture();
	groundTexture.image = new Image();
	groundTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, groundTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, groundTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	groundTexture.image.src = "./Images/moonsurface_4096.png";
	
	// Space Texture
	spaceTexture = gl.createTexture();
	spaceTexture.image = new Image();
	spaceTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, spaceTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spaceTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	spaceTexture.image.src = "./Images/space.gif";
	
	// Planet Texture
	planetTexture = gl.createTexture();
	planetTexture.image = new Image();
	planetTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, planetTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, planetTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	planetTexture.image.src = "./Images/planet.png";
	
	// Debris Texture
	debrisTexture = gl.createTexture();
	debrisTexture.image = new Image();
	debrisTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, debrisTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, debrisTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	debrisTexture.image.src = "./Images/asteroid.jpg";
	
	// Heart Texture
	heartTexture = gl.createTexture();
	heartTexture.image = new Image();
	heartTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, heartTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heartTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	heartTexture.image.src = "./Images/heart.jpg";

	// Health Texture
	healthTexture = gl.createTexture();
	healthTexture.image = new Image();
	healthTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, healthTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, healthTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	healthTexture.image.src = "./Images/health.png";
	
	// Flag Texture
	flagTexture = gl.createTexture();
	flagTexture.image = new Image();
	flagTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, flagTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flagTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	flagTexture.image.src = "./Images/flag_inverse.png";
	
	// Slow Texture
	slowTexture = gl.createTexture();
	slowTexture.image = new Image();
	slowTexture.image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, slowTexture); // bind texture as current texture to use
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, slowTexture.image); // upload texture image to GPU
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // parameters for scaling up
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // parameters for scaling down
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // prevent wrapped s coordinates (repeating)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // prevent wrapped t coordinates
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	slowTexture.image.src = "./Images/slow_inverse.png";
}