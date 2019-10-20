// Select the video element from HTML
const video = document.getElementById('video')

// Configure webcam for each navigator
navigator.getMedia = (
    navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia
    || navigator.msGetUserMedia
)

// Turn on the webcam of the user and append the video stream to our video html element
const startVideo = () => {
    navigator.getMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

// Load all our models asynchronously, if all our Promises are resolved, run the startVideo function
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./assets/models'),
]).then(startVideo).catch(e => console.error(e))


// Add an event listener when the webcam is steaming
video.addEventListener('play', () => {
    // Create a canvas
    const canvas = faceapi.createCanvasFromMedia(video)
    // Append the canvas to our "mainContainer" div
    document.getElementById('mainContainer').append(canvas)
    // Save the size of our video html element and in an Object
    const canvasDisplaySize = { width: video.width, height: video.height }
    // Set the size of our graphical elements from the faceAPI
    faceapi.matchDimensions(canvas, canvasDisplaySize)

    // Every 100ms, do:
    setInterval(
        // anonymous async function:
        async () => {
            // Create an object that will asynchronously detect all the faces on the webcam and the the result
            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions()

            // Reset canvas
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            // Resize the Landmarks
            const resizedDetections = faceapi.resizeResults(detections, canvasDisplaySize)
            // Draw the rectangle of the face detected
            faceapi.draw.drawDetections(canvas, resizedDetections)
            // Draw Landmarks
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            // Draw the name of the expression detected and is confident ratio
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        }, 100)
})