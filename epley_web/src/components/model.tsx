import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl"
import '@mediapipe/face_mesh';
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMeshMediaPipeModelConfig, FaceLandmarksDetector } from "@tensorflow-models/face-landmarks-detection";

export const runDetector = async (video: HTMLVideoElement) => {
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig: MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: "mediapipe",
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: false
    };
    const detector = await faceLandmarksDetection.createDetector(
        model,
        detectorConfig
    );
    const detect = async (detector: FaceLandmarksDetector) => {
        const estimationConfig = { flipHorizontal: false };
        const faces = await detector.estimateFaces(video, estimationConfig);
        console.log(faces)
        // detect(detector)
    };
    detect(detector);
  };