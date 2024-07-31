var _a;
// Set state vars
var isDropperActive = false;
var dropperButton = document.getElementById('activation-button');
var dropperCircle = document.getElementById('dropper-circle');
var circleSVG = document.getElementById('circleSVG');
var dataDialog = document.getElementById('data');
var originalImage = '../assets/1920x1080-4598441-beach-water-pier-tropical-sky-sea-clouds-island-palm-trees.jpg';
var currentColor;
var redimensionPercentage;
dropperCircle.style.backgroundImage = "url('".concat(originalImage, "')");
// Render the image in a canvas
var canvas = document.createElement('canvas');
canvas.classList.add('canvas');
(_a = document.getElementById('functional-wrapper')) === null || _a === void 0 ? void 0 : _a.appendChild(canvas);
var ctx = canvas.getContext('2d', { willReadFrequently: true });
// Ensure image is loaded, avoiding cache issues with browser
var image = new Image();
// Add load listener before loading the image
image.addEventListener('load', function () {
    canvas.width = image.width;
    canvas.height = image.height;
    !!ctx && ctx.drawImage(image, 0, 0);
});
image.src = originalImage;
/**
* Adds functionality to the dropperButton. Once clicked, everything will work. Once clicked again, all event listeners will be removed.
*/
dropperButton.addEventListener('click', function () {
    isDropperActive = !isDropperActive;
    if (isDropperActive) {
        canvas.style.cursor = 'none';
        canvas.addEventListener('mousemove', mouseMoveFunction, true);
        canvas.addEventListener('touchmove', onTouchMove, true);
        canvas.addEventListener('mouseleave', setCircleInvisible, true);
        canvas.addEventListener('click', setMainColor, true);
        canvas.addEventListener('touchend', onTouchEnd, true);
        window.addEventListener('resize', setMagnifiedImageZoom, true);
    }
    else {
        canvas.style.cursor = 'default';
        dropperCircle.style.display = 'none';
        canvas.removeEventListener('mousemove', mouseMoveFunction, true);
        canvas.removeEventListener('touchmove', onTouchMove, true);
        canvas.removeEventListener('mouseleave', setCircleInvisible, true);
        canvas.removeEventListener('click', setMainColor, true);
        canvas.removeEventListener('touchend', onTouchEnd, true);
        window.removeEventListener('resize', setMagnifiedImageZoom, true);
    }
});
/**
 * Sets a magified version of the image for the color dropper's circle
 */
function setMagnifiedImageZoom() {
    redimensionPercentage = (canvas.offsetWidth * 100) / canvas.width;
    dropperCircle.style.backgroundSize = "".concat(canvas.width * 10, "px ").concat(canvas.height * 10, "px");
}
/**
 * Detects the mouse move inside the canvas and passes the coordinates to the functions to detect the current color,
pass it to the border of the dropper's circle and magnify the correct area in the circle's zoom
 * @param event MouseEvent
 */
function mouseMoveFunction(event) {
    setMagnifiedImageZoom();
    dropperCircle.style.display = 'block';
    var rect = canvas.getBoundingClientRect();
    var x = ((event.clientX - rect.left) * 100) / redimensionPercentage;
    var y = ((event.clientY - rect.top) * 100) / redimensionPercentage;
    dropperCircle.style.left = "".concat(event.pageX, "px");
    dropperCircle.style.top = "".concat(event.pageY - canvas.parentElement.offsetTop, "px");
    changeCurrentColor(x, y);
    setZoomColor(currentColor);
    magnifyArea(x, y);
}
/**
 * Mobile alternative for the mouse move function
 * @param event TouchMoveEvent
 */
function onTouchMove(event) {
    setMagnifiedImageZoom();
    dropperCircle.style.display = 'block';
    var rect = canvas.getBoundingClientRect();
    var x = ((event.touches[0].clientX - rect.left) * 100) / redimensionPercentage;
    var y = ((event.touches[0].clientY - rect.top) * 100) / redimensionPercentage;
    dropperCircle.style.left = "".concat(event.touches[0].pageX, "px");
    dropperCircle.style.top = "".concat(event.touches[0].pageY - canvas.parentElement.offsetTop, "px");
    changeCurrentColor(x, y);
    setZoomColor(currentColor);
    magnifyArea(x, y);
}
/**
 * In mobile, i've decided that when the movements ends, the main color is set, as it is really difficult to click while dragging.
Also, mouseLeaveEvent is not triggered in mobile, so we have to set the circle invisible at this moment.
 * @param event TouchEndEvent
 */
function onTouchEnd(event) {
    setMainColor();
    setCircleInvisible();
}
/**
 * Hides the circle from the view and returns the cursor to it's normal state
 */
function setCircleInvisible() {
    //canvas.style.cursor = 'default';
    dropperCircle.style.display = 'none';
}
/**
 * Sets dropper's circle border color
 * @param borderColor String Hexadecimal describing the new color
 */
function setZoomColor(borderColor) {
    dropperCircle.setAttribute('data-color', borderColor);
    var svgDoc = circleSVG.contentDocument;
    if (svgDoc) {
        var paths = svgDoc.querySelectorAll('path');
        paths.forEach(function (path) {
            path.setAttribute('style', "fill:".concat(borderColor));
        });
    }
}
/**
 * Changes the current color globally, so it can be later picked up in the click / TouchEnd events
 * @param x Number, X Coordinate where the mouse is place to obtain the color from
 * @param y Number, Y Coordinate where the mouse is place to obtain the color from
 */
function changeCurrentColor(x, y) {
    var pixel = !!ctx && ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    currentColor = rgbToHexadecimal(pixel[0], pixel[1], pixel[2]);
}
/**
 * Transform the RGB color obtained from the canvas to hexadecimal
 * @param r Number red channel
 * @param g Number green
 * @param b Number blue
 * @returns String
 */
function rgbToHexadecimal(r, g, b) {
    return '#' + [r, g, b].map(function (x) {
        var hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
/**
NOTE: The maginifier could be done using a rect in canvas, but after trying, the canvas takes a bit of time to render -poor performance-, and the user experience is poor.
I've solved it by adding a tick depending on the screen FPS, so the background is not recalculated every mousemove event, but, althought I applied a smoothing effect,
the circle doesn't move as fast as the mouse.
Also, if we wanted to work with bigger images, we may find browser limitations and then find orselves forced to split the main image in different canvases.
Given that case, we wouldn't be able to work with a rect inside just one canvas.
Therefore, I've choosen to apply this little CSS hack, as we really do not need any data from the amplified image as we are getting it from the original canvas.
JS test can be found in index.js
 * @param x Number, X Coordinate where the mouse is place to obtain the color from
 * @param y Number, Y Coordinate where the mouse is place to obtain the color from
 */
function magnifyArea(x, y) {
    if (ctx) {
        var magnificationFactor = 10;
        var magnifierOffset = 75; // Half of the magnifier size plus border
        dropperCircle.style.backgroundPosition = "-".concat((Math.round(x) * magnificationFactor) - magnifierOffset, "px -").concat((Math.round(y) * magnificationFactor) - magnifierOffset, "px");
    }
}
/**
 * Triggers on click and changes the string with the color's hex in the dialog box
 */
function setMainColor() {
    if (!!dataDialog)
        dataDialog.innerText = currentColor;
}
