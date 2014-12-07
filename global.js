// global components
var canvas;
var gl;
var program;
var length = 0.5;
var time = 0.0;
var timer = new Timer();
var SMART_MOVEMENT = false;
var DEBUGGING_MODE = false;
var RESET_READY = false;

var gamestart = false;
var life = 3;
var score = 0;
var invincibility = 0;
var invincibilityPeriod = 45; // number of invincibility frames after being hit
var previouslyHit;

// navigation system variables
var x = 0; // x-axis displacement from origin (controls right/left)
var y = 0; // y-axis displacement from origin (controls up/down)
var z = 0; // z-axis displacement from origin (controls back/forward)
var textureDegree = 0;
var textureScrollSpeed = 0.005;

var scrollX = 0;
var scrollY = 0;
var scrollZ = 0;

// buffers for vertices and normals
var positionBuffer;
var normalBuffer;
var uvBuffer;

// view transformation matrices
var uniform_mvpMatrix;
var viewMatrix;
var projectionMatrix;
var mvpMatrix;
var orthoProjectionMatrix;

// light position and attribute data
var attribute_position;
var attribute_normal;
var uniform_lightPosition;
var uniform_shininess;
var uniform_sampler;

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);

// ground arrays
var groundVertices = [
	vec3(length, 0, length),
	vec3(length, 0, -length),
	vec3(-length, 0, -length),
	vec3(-length, 0, length)
];
var pointsArray = [];
var normalsArray = [];
var uvArray = [];
var index = 0;

//cube stuff
var vertices = [
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

//object data

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

var NUM_DEBRIS = 20;
var NUM_HEALTH = 1;
var NUM_FLAG = 2;
var NUM_SLOW = 1;

//sphere data
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var planetPoints;
var planetNormals;
var planetUv;
var planetIndexBuffer;
var planetIndexData;

// heart position
var heartPositions = [
	vec3(-4.5, 4.5, 0), 
    vec3(-3.5, 4.5, 0), 
    vec3(-2.5, 4.5, 0)
];

// texture
var groundTexture;
var spaceTexture;
var planetTexture;
var debrisTexture;
var heartTexture;
var healthTexture;
var flagTexture;
var slowTexture;

// view matrix
var eye = vec3(0, 1, 0.001);
var at = vec3(0, 0, -100);
var up = vec3(0, 1, 0);
