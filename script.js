const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const gridCanvas = document.getElementById("grid-canvas");
const gridCtx = gridCanvas.getContext("2d");

const colorPicker = document.getElementById("color-picker");
const pixelSizeInput = document.getElementById("pixel-size");

// Ajuste del tamaño del lienzo
canvas.width = 800;
canvas.height = 400;

gridCanvas.width = 800;
gridCanvas.height = 400;

// Desactivar antialiasing
ctx.imageSmoothingEnabled = false;
gridCtx.imageSmoothingEnabled = false;

let isDrawing = false;
let eraseMode = false;
let undoStack = [];
let redoStack = [];

// eventos con mouse
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", drawPixel);
canvas.addEventListener("click", drawPixel);

// eventos con pantallas tactiles
canvas.addEventListener("touchstart", startDrawingTouch);
canvas.addEventListener("touchend", stopDrawingTouch);
canvas.addEventListener("touchmove", drawPixelTouch);

canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    toggleEraseMode();
});

function startDrawing() {
    isDrawing = true;
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Comienza una nueva ruta después de dejar de dibujar
    saveState();
    drawGrid(); // Vuelve a dibujar la cuadrícula después de cada cambio
}

function drawPixel(event) {
    if (!isDrawing && event.type !== "click") return;

    const x = event.clientX - canvas.getBoundingClientRect().left;
    const y = event.clientY - canvas.getBoundingClientRect().top;

    const pixelSize = parseInt(pixelSizeInput.value); // Ajusta el tamaño del píxel según el valor actual

    // Calcula las coordenadas del píxel
    const pixelX = Math.floor(x / pixelSize) * pixelSize;
    const pixelY = Math.floor(y / pixelSize) * pixelSize;

    if (eraseMode) {
        // Borra el contenido usando clearRect en lugar de fillRect
        ctx.clearRect(pixelX, pixelY, pixelSize, pixelSize);
    } else {
        // Obtiene el color seleccionado de la paleta
        const selectedColor = colorPicker.value;

        // Dibuja un píxel del color seleccionado
        ctx.fillStyle = selectedColor;
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
    }

    if (event.type === "click") {
        saveState(); // Guarda el estado solo cuando se hace clic (no durante el movimiento)
        drawGrid(); // Vuelve a dibujar la cuadrícula después de cada cambio
    }
}

function startDrawingTouch(event) {
    event.preventDefault(); // Evita el desplazamiento y el zoom en dispositivos táctiles
    startDrawing(getTouchCoords(event));
}

function stopDrawingTouch(event) {
    event.preventDefault();
    stopDrawing();
}

function drawPixelTouch(event) {
    event.preventDefault();
    drawPixel(getTouchCoords(event));
}

function getTouchCoords(event) {
    const touch = event.touches[0];
    return { clientX: touch.clientX, clientY: touch.clientY };
}

function saveState() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    redoStack = [];
}

// Función para dibujar la cuadrícula en el nuevo canvas
function drawGrid() {
    const gridSize = parseInt(pixelSizeInput.value);
    const canvasWidth = gridCanvas.width;
    const canvasHeight = gridCanvas.height;

    gridCtx.clearRect(0, 0, canvasWidth, canvasHeight); // Borra el canvas de la cuadrícula antes de redibujarla

    gridCtx.beginPath();
    gridCtx.strokeStyle = "#CCCCCC"; // Color de la cuadrícula
    gridCtx.lineWidth = 1;

    // Dibuja las líneas verticales
    for (let x = 0; x <= canvasWidth; x += gridSize) {
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, canvasHeight);
    }

    // Dibuja las líneas horizontales
    for (let y = 0; y <= canvasHeight; y += gridSize) {
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(canvasWidth, y);
    }

    gridCtx.stroke();
}

// Llama a la función para dibujar la cuadrícula inicial
drawGrid();

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
}

function toggleEraseMode() {
    eraseMode = !eraseMode;
    canvas.style.cursor = eraseMode ? "auto" : "crosshair";
}

function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        const imageData = undoStack[undoStack.length - 1];
        ctx.putImageData(imageData, 0, 0);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const imageData = redoStack.pop();
        ctx.putImageData(imageData, 0, 0);
        undoStack.push(imageData);
    }
}

function exportCanvas() {
    const imageDataURL = canvas.toDataURL(); // Obtén la imagen como una URL de datos
    const link = document.createElement("a");
    link.href = imageDataURL;
    link.download = "pixel_art.png"; // Puedes cambiar el nombre del archivo según tus preferencias
    link.click();
}

function changePixelSize() {
    const newSize = parseInt(pixelSizeInput.value);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo al cambiar el tamaño
    ctx.lineWidth = newSize;
    ctx.strokeStyle = colorPicker.value;
    drawGrid();
}

function selectColor(color) {
    colorPicker.value = color;
    ctx.fillStyle = color;
}