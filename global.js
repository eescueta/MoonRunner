// GLOBAL VARIABLES:
	var canvas;
	var gl;
	var program;
	var length = 0.5;
	var time = 0.0;
	var timer = new Timer();

// GAME SETTINGS:
	var SMART_MOVEMENT = false;
	var DEBUGGING_MODE = false;
	var RESET_READY = false;
	
	// constant game data (i.e. number of each object to render, total health capacity, etc.
	var NUM_DEBRIS = 20; 		// (MAX: 40)
	var NUM_HEALTH = 1; 		// (MAX: 10)
	var NUM_FLAG = 2; 			// (MAX: 10)
	var NUM_SLOW = 1; 			// (MAX: 10)
	var FLAG_NUM_POINTS = 250;
	var MAX_TOTAL_HEALTH = 3;	// incrementing this beyond 3 will require heartPositions to be modified
	var CAPTION_TIME_LENGTH = 2000; // in milliseconds
	
	// invincibility frames
	var BORDER_COLOR_INVINCIBLE = "rgb(102, 178, 255)";
	var BORDER_COLOR_NORMAL = "rgb(0, 0, 0)";

	// player progress
	var gamestart = false;
	var instructionsOn = false;
	var life = 3;
	var score = 0;
	var invincibility = 0;
	var invincibilityPeriod = 45; // number of invincibility frames after being hit
	var previouslyHit;
	var captionTimer = CAPTION_TIME_LENGTH;

// NAVIGATION SYSTEM:
	var x = 0;
	var y = 0;
	var z = 0;
	var textureDegree = 0; // rotational degree (left/right turning)
	var textureScrollSpeed = 0.005; // speed
	var scrollX = 0;
	var scrollY = 0;
	var scrollZ = 0;
	var turnInterval = 0;

// BUFFER VARIABLES:
	var positionBuffer;
	var normalBuffer;
	var uvBuffer;

// VIEW/TRANSFORMATION MATRIX:
	var uniform_mvpMatrix;
	var viewMatrix;
	var projectionMatrix;
	var mvpMatrix;
	var orthoProjectionMatrix;

// VIEW MATRIX:
	var eye = vec3(0, 1, 0.001);
	var at = vec3(0, 0, -100);
	var up = vec3(0, 1, 0);

// LIGHT AND SHADING:
	var attribute_position;
	var attribute_normal;
	var uniform_lightPosition;
	var uniform_shininess;
	var uniform_sampler;
	var shininess = 50;
	var lightPosition = vec3(0.0, 0.0, 0.0);

// TEXTURES:
	var groundTexture;
	var spaceTexture;
	var planetTexture;
	var debrisTexture;
	var heartTexture;
	var healthTexture;
	var flagTexture;
	var slowTexture;

// GROUND VARIABLES:
	var groundVertices = [
		vec3(length, 0, length),
		vec3(length, 0, -length),
		vec3(-length, 0, -length),
		vec3(-length, 0, length)
	];
	var planePoints = [];
	var planeNormals = [];
	var planeUv = [];
	var index = 0;

// CUBE VARIABLES:
	var cubeVertices = [
	        vec3(  length,   length, length ), //vertex 0
	        vec3(  length,  -length, length ), //vertex 1
	        vec3( -length,   length, length ), //vertex 2
	        vec3( -length,  -length, length ),  //vertex 3 
	        vec3(  length,   length, -length ), //vertex 4
	        vec3(  length,  -length, -length ), //vertex 5
	        vec3( -length,   length, -length ), //vertex 6
	        vec3( -length,  -length, -length )  //vertex 7   
	    ];
	var cubePoints = [];
	var cubeNormals = [];
	var cubeUv = [];

//SPHERE VARIABLES:
	var planetPoints;
	var planetNormals;
	var planetUv;
	var planetIndexBuffer;
	var planetIndexData;

// OBJECT DATA:
	// data for debris continually being re-rendered (MAX 40)
	var debris_positionX = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	var debris_positionZ = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	// data for health pack(s) continually being re-rendered (MAX 10)
	var health_positionX = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	var health_positionZ = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	// data for flag(s) continually being re-rendered (MAX 10)
	var flag_positionX = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	var flag_positionZ = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	// data for slow sign(s) continually being re-rendered (MAX 10)
	var slow_positionX = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	var slow_positionZ = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
	// life bar HUD data
	var heartPositions = [
		vec3(-4.5, 4.5, 0), 
	    vec3(-3.5, 4.5, 0), 
	    vec3(-2.5, 4.5, 0)
	];
