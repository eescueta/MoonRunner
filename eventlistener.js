var keys = {};

// on key down, set key position in array to true
window.addEventListener('keydown', function(e) {
    keys[e.keyCode || e.which] = true;
}, true);

// on key up, set key position in array to false
window.addEventListener('keyup', function(e) {
    keys[e.keyCode || e.which] = false;
}, true);

// using the keys array above, if the left or right arrow key is currently pressed, turn view angle
// this function is used to get around the delay which occurs when a key is pressed down and held
// allows for faster/smoother controls (albeit rather hard to use)
function loopedTurnControls() {
	// left arrow
	if(keys[37]) {
		if(textureDegree>-15) {
			textureDegree-=0.25;
			scrollX += 0.1;
			$(".wheel").rotate({ animateTo:-20});
			turnInterval = 0;
		}
	}
	// right arrow
	if(keys[39]) {
		if(textureDegree<15) {
			textureDegree+=0.25;
			scrollX -= 0.1;
			$(".wheel").rotate({ animateTo:-20});
			turnInterval = 0;
		}
	}
	setTimeout(loopedTurnControls, 10);
}

function initEventListener() {
	

	// if smart movement is on, use looped turn controls instead
	if(SMART_MOVEMENT)
		loopedTurnControls();
	
	document.onkeydown = function(e) {
		e = e || window.event;
		
		// allow only if debugging mode is on
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
			else if(e.keyCode===74) { // "j" (speed up)
				textureScrollSpeed+=0.0005;
			}
			else if(e.keyCode===75) { // "k" (slow down)
				if(textureScrollSpeed>=0.0005)
					textureScrollSpeed-=0.0005;
			}
			else if(e.keyCode===27) { // "esc" resets the camera to original position
				x=0;
				y=0;
				z=0;
			}
		}
		
		// allow normal, non-looped turning only if smart movement is off
		if(!SMART_MOVEMENT) {
			if(e.keyCode===37) { // "left" (turn left)
				if(textureDegree>-15) {
					textureDegree-=0.25;
					scrollX += 0.1;
					$(".wheel").rotate({ animateTo:-20});
					turnInterval = 0;
				}
			}
			else if( e.keyCode===39) { // "right" (turn right)
				if(textureDegree<15) {
					textureDegree+=0.25;
					scrollX -= 0.1;
					$(".wheel").rotate({ animateTo:20});
					turnInterval = 0;
				}
			}
		}
		
		if(RESET_READY && e.keyCode===84) { // "t" (go back to front page)
			// instead of resetting the game, user can go to title page
			// this sets gamestart to false, removes the reset option, and inits the world
			$( ".interface" ).html("<img src='./Images/start.png'>");
			console.log("TEST");
			init();
			setCaption("");
			gamestart = false;
			RESET_READY = false;
		}
		else if(RESET_READY && e.keyCode===82) { // "r" (reset the game)
			// reset the game using loadWorld only if the player is on the game over screen
			// $( ".interface" ).html("");
			$( ".interface" ).html("<img class='wheel' src='./Images/handle.png'>");
			loadWorld();
			RESET_READY = false;
		}
		else if(e.keyCode===80) { // "p" (start the game)
			// start the game using init only if the player is on the game start screen
			if (!gamestart) {
				// $( ".interface" ).html("");
				$( ".interface" ).html("<img class='wheel' src='./Images/handle.png'>");
				gamestart = true;
				init();
			}
		}
		else if(!gamestart&& e.keyCode===73) { // "i" (toggle instructions before game starts)
			instructionsOn = !instructionsOn;
			if (instructionsOn)
				$( ".interface" ).html("<img src='./Images/instructions.png'>");
			else
				$( ".interface" ).html("<img src='./Images/start.png'>");
		}
	};
}
