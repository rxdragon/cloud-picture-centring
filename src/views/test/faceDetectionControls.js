const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'

let selectedFaceDetector = SSD_MOBILENETV1

// ssd_mobilenetv1 options
const minConfidence = 0.5

// tiny_face_detector options
const inputSize = 512
const scoreThreshold = 0.5

export function getFaceDetectorOptions () {
  return selectedFaceDetector === SSD_MOBILENETV1
    ? new window.faceapi.SsdMobilenetv1Options({ minConfidence })
    : new window.faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
}

export function getCurrentFaceDetectionNet () {
  if (selectedFaceDetector === SSD_MOBILENETV1) {
    return window.faceapi.nets.ssdMobilenetv1
  }
  if (selectedFaceDetector === TINY_FACE_DETECTOR) {
    return window.faceapi.nets.tinyFaceDetector
  }
}

export function isFaceDetectionModelLoaded () {
  return !!getCurrentFaceDetectionNet().params
}

export async function changeFaceDetector (detector) {
  selectedFaceDetector = detector
  if (!isFaceDetectionModelLoaded()) {
    await getCurrentFaceDetectionNet().load('/')
  }
}
