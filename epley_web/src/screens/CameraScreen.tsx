import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../facemesh/FaceModel";
import { videoSize } from "../config";

interface Props {
    landmarksRef: React.MutableRefObject<Keypoint[]>
}

function CameraScreen ({landmarksRef}: Props) {
      
    const videoConstraints = {
        width: videoSize.width,
        height: videoSize.height,
        facingMode: "user",
    };

    const [loaded, setLoaded] = useState(false)
    const meshActive = useRef(false)
    const meshActiveCallback = () => meshActive.current
    const handleVideoLoad = (videoNode: SyntheticEvent) => {
        const video = videoNode.target as HTMLVideoElement
        if (video.readyState !== 4) return;
        if (loaded) return;
        const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
        runDetector(video, canvas, landmarksRef, meshActiveCallback); //running detection on video
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
                <button  className="btn btn-warning" onClick={() => meshActive.current = !meshActive.current} 
                         style={{position: 'absolute', top: videoSize.height + 10, left: 0}}>
                    Toggle Face Mesh
                </button> 
                <canvas id="faceMeshCanvas" style={{
                        position: "absolute", 
                        top: 0, left: 0, 
                        width: videoSize.width, height: videoSize.height}}/>
            </div>
        </div>
    );
}

export default CameraScreen;