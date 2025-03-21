const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
});
camera.start();

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                {color: 'mediumvioletred', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: "#181a1b", lineWidth: 5});
        }
    }
    canvasCtx.restore();
}

const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],   // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],   // Index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
    [0, 17], [17, 18], [18, 19], [19, 20]  // Pinky
];

function drawConnectors(ctx, landmarks, connections, style) {
    const {color, lineWidth} = style;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    for (const connection of connections) {
        const [startIdx, endIdx] = connection;
        ctx.moveTo(landmarks[startIdx].x * canvasElement.width,
            landmarks[startIdx].y * canvasElement.height);
        ctx.lineTo(landmarks[endIdx].x * canvasElement.width,
            landmarks[endIdx].y * canvasElement.height);
    }
    ctx.stroke();
}

function drawLandmarks(ctx, landmarks, style) {
    const {color, lineWidth} = style;
    ctx.fillStyle = color;
    for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvasElement.width,
            landmark.y * canvasElement.height,
            lineWidth, 0, 2 * Math.PI);
        ctx.fill();
    }
}