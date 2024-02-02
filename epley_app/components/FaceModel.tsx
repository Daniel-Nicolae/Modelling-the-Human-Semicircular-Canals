// import '@mediapipe/face_mesh';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { Image } from 'react-native';


const testImage = <Image source={require("../assets/1.jpg")}/>

const FaceModel = () => {
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
  console.log(model)

  const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
                  // or 'base/node_modules/@mediapipe/face_mesh' in npm.
    refineLandmarks: false
  };

  async () => {
    const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
    // const faces = await detector.estimateFaces(testImage);
    console.log(detector)
  }

  return
}

export default FaceModel

