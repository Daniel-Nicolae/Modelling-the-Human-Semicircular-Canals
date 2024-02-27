import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl"
import '@mediapipe/face_mesh';
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { MediaPipeFaceMeshMediaPipeModelConfig, FaceLandmarksDetector } from "@tensorflow-models/face-landmarks-detection";
import { drawFaceMesh } from "./FaceDrawer";

export const runDetector = async (video: HTMLVideoElement, canvas: HTMLCanvasElement, mirrored: boolean,
                                  landmarksRef: React.MutableRefObject<faceLandmarksDetection.Keypoint[]>, 
                                  meshActiveCallback: () => boolean) => {
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
    const detectorConfig: MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: "mediapipe",
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: false
    }
    const detector = await faceLandmarksDetection.createDetector(model, detectorConfig)
    
    const detect = async (detector: FaceLandmarksDetector) => {
        if (video) {
            const faces = await detector.estimateFaces(video, {flipHorizontal: mirrored, staticImageMode: false})
            if (faces.length !== 0) {
                landmarksRef.current = faces[0].keypoints
                const ctx = canvas.getContext('2d')
                ctx!.clearRect(0, 0, canvas.width, canvas.height)
                if (meshActiveCallback()) drawFaceMesh(canvas, faces[0].keypoints)    
        }}
    }
    const modelLoop = setInterval(detect, 20, detector)
    return modelLoop
}