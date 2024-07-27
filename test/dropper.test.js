/**
 * @jest-environment jsdom
 */

require('@testing-library/jest-dom');
const { fireEvent } = require('@testing-library/dom');

let isDropperActive;
let dropperButton;
let dropperCircle;
let circleSVG;
let dataDialog;
let originalImage;
let currentColor;
let redimensionPercentage;
let canvas;
let ctx;
let image;

function initializeDOM() {
    document.body.innerHTML = `
        <div id="functional-wrapper"></div>
        <button id="activation-button"></button>
        <div id="dropper-circle"></div>
        <object id="circleSVG"></object>
        <div id="data"></div>
    `;

    isDropperActive = false;
    dropperButton = document.getElementById('activation-button');
    dropperCircle = document.getElementById('dropper-circle');
    circleSVG = document.getElementById('circleSVG');
    dataDialog = document.getElementById('data');
    originalImage = '../assets/1920x1080-4598441-beach-water-pier-tropical-sky-sea-clouds-island-palm-trees.jpg';
    currentColor = '';
    redimensionPercentage = 100;
    dropperCircle.style.backgroundImage = `url('${originalImage}')`;

    canvas = document.createElement('canvas');
    canvas.classList.add('canvas');
    document.getElementById('functional-wrapper').appendChild(canvas);

    ctx = {
        drawImage: jest.fn(),
        getImageData: jest.fn(() => ({
            data: [255, 0, 0, 255], // Simula un píxel rojo
        })),
    };
    canvas.getContext = jest.fn(() => ctx);

    image = new Image();
    image.src = originalImage;

    image.addEventListener('load', () => {
        canvas.width = 1920;
        canvas.height = 1080;
        ctx.drawImage(image, 0, 0);
    });

    image.dispatchEvent(new Event('load'));

    dropperButton.addEventListener('click', () => {
        isDropperActive = !isDropperActive;
        if (isDropperActive) {
            canvas.style.cursor = 'none';
            canvas.addEventListener('mousemove', mouseMoveFunction, true);
            canvas.addEventListener('touchmove', onTouchMove, true);
            canvas.addEventListener('mouseleave', setCircleInvisible, true);
            canvas.addEventListener('click', setMainColor, true);
            canvas.addEventListener('touchend', onTouchEnd, true);
            window.addEventListener('resize', setMagnifiedImageZoom, true);
        } else {
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
}

beforeEach(() => {
    initializeDOM();

    window.setMagnifiedImageZoom = setMagnifiedImageZoom;
    window.mouseMoveFunction = mouseMoveFunction;
    window.onTouchMove = onTouchMove;
    window.onTouchEnd = onTouchEnd;
    window.setCircleInvisible = setCircleInvisible;
    window.setMainColor = setMainColor;
    window.changeCurrentColor = changeCurrentColor;
    window.setZoomColor = setZoomColor;
    window.rgbToHexadecimal = rgbToHexadecimal;
    window.magnifyArea = magnifyArea;
});

function setMagnifiedImageZoom() {
    redimensionPercentage = (canvas.offsetWidth * 100) / canvas.width;
    dropperCircle.style.backgroundSize = `${canvas.width * 10}px ${canvas.height * 10}px`;
}

function mouseMoveFunction(event) {
    setMagnifiedImageZoom();
    dropperCircle.style.display = 'block';
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * 100) / redimensionPercentage;
    const y = ((event.clientY - rect.top) * 100) / redimensionPercentage;
    dropperCircle.style.left = `${event.pageX}px`;
    dropperCircle.style.top = `${event.pageY - canvas.parentElement.offsetTop}px`;
    changeCurrentColor(x, y);
    setZoomColor(currentColor);
    magnifyArea(x, y);
}

function onTouchMove(event) {
    setMagnifiedImageZoom();
    dropperCircle.style.display = 'block';
    const rect = canvas.getBoundingClientRect();
    const x = ((event.touches[0].clientX - rect.left) * 100) / redimensionPercentage;
    const y = ((event.touches[0].clientY - rect.top) * 100) / redimensionPercentage;
    dropperCircle.style.left = `${event.touches[0].pageX}px`;
    dropperCircle.style.top = `${event.touches[0].pageY - canvas.parentElement.offsetTop}px`;
    changeCurrentColor(x, y);
    setZoomColor(currentColor);
    magnifyArea(x, y);
}

function onTouchEnd(event) {
    setMainColor();
    setCircleInvisible();
}

function setCircleInvisible() {
    canvas.style.cursor = 'default';
    dropperCircle.style.display = 'none';
}

function setZoomColor(borderColor) {
    dropperCircle.setAttribute('data-color', borderColor);
    const svgDoc = circleSVG.contentDocument;
    if (svgDoc) {
        const paths = svgDoc.querySelectorAll('path');
        paths.forEach(path => {
            path.setAttribute('style', `fill:${borderColor}`);
        });
    }
}

function changeCurrentColor(x, y) {
    const pixel = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    currentColor = rgbToHexadecimal(pixel[0], pixel[1], pixel[2]);
}

function rgbToHexadecimal(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function magnifyArea(x, y) {
    if (ctx) {
        const magnificationFactor = 10;
        const magnifierOffset = 75; // Half of the magnifier size plus border
        dropperCircle.style.backgroundPosition = `-${(Math.round(x) * magnificationFactor) - magnifierOffset}px -${(Math.round(y) * magnificationFactor) - magnifierOffset}px`;
    }
}

function setMainColor() {
    dataDialog.innerText = currentColor;
}

test('toggles dropper functionality on button click', () => {
    expect(isDropperActive).toBe(false);
    fireEvent.click(dropperButton);
    expect(isDropperActive).toBe(true);
    fireEvent.click(dropperButton);
    expect(isDropperActive).toBe(false);
});

test('sets cursor to none when dropper is active', () => {
    fireEvent.click(dropperButton);
    expect(canvas.style.cursor).toBe('none');
});

test('shows dropper circle on mouse move', () => {
    fireEvent.click(dropperButton);
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    expect(dropperCircle).toBeVisible();
});

test('hides dropper circle on mouse leave', () => {
    fireEvent.click(dropperButton);
    fireEvent.mouseLeave(canvas);
    expect(dropperCircle).not.toBeVisible();
});

test('sets main color on click', () => {
    fireEvent.click(dropperButton);
    fireEvent.click(canvas);
    expect(dataDialog.innerText).toBe(currentColor);
});

test('calculates the correct color on mouse move', () => {
    fireEvent.click(dropperButton);
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    // Simulate getting color data from canvas
    changeCurrentColor(100, 100);
    expect(currentColor).toBe('#ff0000');
});
