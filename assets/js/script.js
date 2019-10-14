const video = document.getElementById('video')

const startVideo = () => {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/models'),
]).then(startVideo)



video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.getElementById('main').append(canvas)
    const canvasDisplaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, canvasDisplaySize)

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        const resizedDetections = faceapi.resizeResults(detections, canvasDisplaySize)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    }, 100)
})