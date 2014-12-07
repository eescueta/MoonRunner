var keys = {};

window.addEventListener('keydown', function(e) {
    keys[e.keyCode || e.which] = true;
}, true);

window.addEventListener('keyup', function(e) {
    keys[e.keyCode || e.which] = false;
}, true);

function loopTurnControls() {
	if(keys[37]) {
		if(textureDegree>-15) {
			textureDegree-=0.25;
			scrollX += 0.1;
		}
	}
	if(keys[39]) {
		if(textureDegree<15) {
			textureDegree+=0.25;
			scrollX -= 0.1;
		}
	}
	setTimeout(loopTurnControls, 10);
}

function initEventListener() {
	
	if(SMART_MOVEMENT)
		loopTurnControls();
	
	document.onkeydown = function(e) {
		e = e || window.event;
		
		if(DEBUGGING_MODE) {
			if(e.keyCode===87) { // "w" (move forward)
				z+=0.1;
			}
			else if(e.keyCode===83) { // "s" (move back)
				z-=0.1;
			}
			else if(e.keyCode===65) { // "a" (move left)
				x+=0.1;
			}
			else if(e.keyCode===68) { // "d" (move right)
				x-=0.1;
			}
			else if(e.keyCode===38) { // "up" (move camera up)
				y-=0.1;
				scrollZ += 0.1;
			}
			else if( e.keyCode===40) { // "down" (move camera down)
				y+=0.1;
				scrollZ -= 0.1;
			}
			else if(e.keyCode===73) { // "i" (speed up)
				textureScrollSpeed+=0.0005;
			}
			else if(e.keyCode===79) { // "o" (slow down)
				if(textureScrollSpeed>=0.0005)
					textureScrollSpeed-=0.0005;
			}
			else if(e.keyCode===27) { // "esc" resets the camera to original position
				x=0;
				y=0;
				z=0;
			}
		}
		
		if(!SMART_MOVEMENT) {
			if(e.keyCode===37) { // "left" (turn left)
				if(textureDegree>-15) {
					textureDegree-=0.25;
					scrollX += 0.1;
				}
			}
			else if( e.keyCode===39) { // "right" (turn right)
				if(textureDegree<15) {
					textureDegree+=0.25;
					scrollX -= 0.1;
				}
			}
		}
		
		if(e.keyCode===82) { // "r" (reset the game)
			if(RESET_READY) {
				$( ".interface" ).html("");
				loadWorld();
				RESET_READY = false;
			}
			
		}
		else if(e.keyCode===80) { // "p" (start the game)
			if (!gamestart) {
				$( ".interface" ).html("");
				gamestart = true;
				init();
			}
		}
	};
}
