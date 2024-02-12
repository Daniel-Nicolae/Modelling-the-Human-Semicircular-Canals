import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../facemesh/FaceModel";
import { videoSize } from "../config";
import { drawFaceMesh } from "../facemesh/FaceDrawer";

interface Props {
    // landmarksCallback: (landmarks: Keypoint[]) => void
    landmarksCallback: React.MutableRefObject<Keypoint[]>
}

function CameraScreen ({landmarksCallback}: Props) {
      
    const videoConstraints = {
        width: videoSize.width,
        height: videoSize.height,
        facingMode: "user",
    };

    const [loaded, setLoaded] = useState(false);
    const [landmarks, setLandmarks] = useState<Keypoint[]>([])
    const handleVideoLoad = (videoNode: SyntheticEvent) => {
        const video = videoNode.target as HTMLVideoElement
        if (video.readyState !== 4) return;
        if (loaded) return;
        runDetector(video, setLandmarks); //running detection on video
        setLoaded(true);
    };

    const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
    useEffect(() => {
        // landmarksCallback(landmarks)
        landmarksCallback.current = landmarks
        drawFaceMesh(canvas, landmarks)
    }, [landmarks])

    return (
        <div style={{position: "relative"}}>
            <div>
                <Webcam 
                    videoConstraints={videoConstraints} 
                    mirrored={true} 
                    onLoadedData={handleVideoLoad}
                    style={{position: "absolute", top: 0, left: 0}}
                />
                <canvas id="faceMeshCanvas" style={{
                        position: "absolute", 
                        top: 0, left: 0, 
                        width: videoSize.width, height: videoSize.height}}/>
            </div>
        </div>
    );
}

export default CameraScreen;