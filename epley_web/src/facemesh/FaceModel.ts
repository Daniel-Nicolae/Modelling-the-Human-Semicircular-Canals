import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl"
import '@mediapipe/face_mesh';
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMeshMediaPipeModelConfig, FaceLandmarksDetector } from "@tensorflow-models/face-landmarks-detection";

export const runDetector = async (video: HTMLVideoElement, callback: (landmarks: faceLandmarksDetection.Keypoint[]) => void) => {
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
        const estimationConfig = { flipHorizontal: true };
        const faces = await detector.estimateFaces(video, estimationConfig);
        if (faces.length !== 0) callback(faces[0].keypoints)
    };
    const modelLoop = setInterval(detect, 40, detector);
  };