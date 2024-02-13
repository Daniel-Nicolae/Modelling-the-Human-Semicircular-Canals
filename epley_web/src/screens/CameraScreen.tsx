import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../facemesh/FaceModel";
import { videoSize } from "../config";
import { drawFaceMesh } from "../facemesh/FaceDrawer";

interface Props {
    landmarksRef: React.MutableRefObject<Keypoint[]>
}

function CameraScreen ({landmarksRef}: Props) {
      
    const videoConstraints = {
        width: videoSize.width,
        height: videoSize.height,
        facingMode: "user",
    };

    const [loaded, setLoaded] = useState(false);
    const handleVideoLoad = (videoNode: SyntheticEvent) => {
        const video = videoNode.target as HTMLVideoElement
        if (video.readyState !== 4) return;
        if (loaded) return;
        const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
        runDetector(video, canvas, landmarksRef); //running detection on video
        setLoaded(true);
    };

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