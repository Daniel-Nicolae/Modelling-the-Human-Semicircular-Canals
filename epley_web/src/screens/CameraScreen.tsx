import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../components/model";
import { videoSize } from "../config";
import { drawFaceMesh } from "../facemesh/FaceMesh";

interface Props {
    onNext: () => void
    onDetection: (landmarks: Keypoint[]) => void
}

function CameraScreen ({onNext, onDetection}: Props) {
      
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

    useEffect(() => {
        onDetection(landmarks)
        const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
        drawFaceMesh(canvas, landmarks, "o")
    }, [landmarks])

    const webcamRef = useRef<Webcam>(null);

    return (
        <div style={{position: "relative"}}>
            <p>Make sure you can see your face clearly.</p>
            <div>
                <Webcam 
                    ref={webcamRef}
                    videoConstraints={videoConstraints} 
                    mirrored={true} 
                    onLoadedData={handleVideoLoad}
                    style={{position: "absolute", top: 30, left: 0}}
                />
                <canvas id="faceMeshCanvas" style={{
                        position: "absolute", 
                        top: 495, left: 0, 
                        width: videoSize.width, height: videoSize.height}}/>
            </div>
            <p/>
            <button type="button" className="btn btn-primary" onClick={onNext} style={{marginTop: videoSize.height + 20}}>Draw Canal</button>
        </div>
    );
}

export default CameraScreen;