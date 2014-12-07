/**
 * 
 */

function initEventListener() {
	document.onkeydown = function(e) {
		e = e || window.event;
		
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
		else if(e.keyCode===37) { // "left" (turn left)
			//console.log(positionZ);
			if(textureDegree>-15) {
				textureDegree-=0.5;
				scrollX += 0.1;
			}
		}
		else if(e.keyCode===39) { // "right" (turn right)
			//console.log(positionZ);
			if(textureDegree<15) {
				textureDegree+=0.5;
				scrollX -= 0.1;
			}
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
	};
}
