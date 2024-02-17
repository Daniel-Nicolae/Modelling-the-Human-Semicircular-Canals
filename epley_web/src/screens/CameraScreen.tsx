import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../facemesh/FaceModel";
import { videoSize } from "../config";

interface Props {
    landmarksRef: React.MutableRefObject<Keypoint[]>
    mirrored: boolean
    setMirrored: (mirrored: boolean) => void
}

function CameraScreen ({landmarksRef, mirrored, setMirrored}: Props) {
      
    const videoConstraints = {
        width: videoSize.width,
        height: videoSize.height,
        facingMode: "user",
    };

    const webcamRef = useRef<Webcam>(null)
    // const loopRef = useRef<NodeJS.Timer>()
    const loopRef = useRef<NodeJS.Timer>()

    const [loaded, setLoaded] = useState(false)

    const meshActive = useRef(false)
    const meshActiveCallback = () => meshActive.current

    const handleVideoLoad = async (videoNode: SyntheticEvent) => {
        const video = videoNode.target as HTMLVideoElement
        if (video.readyState !== 4) return;
        if (loaded) return;
        const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
        loopRef.current = await runDetector(video, mirrored, canvas, landmarksRef, meshActiveCallback) //running detection on video
        setLoaded(true);
    };

    const handleMirror = async () => {
        setMirrored(!mirrored)
        mirrored = !mirrored
        const video = webcamRef.current!.video as HTMLVideoElement
        const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
        clearInterval(loopRef.current)
        loopRef.current = await runDetector(video, mirrored, canvas, landmarksRef, meshActiveCallback)
    }

    return (
        <div style={{position: "relative"}}>
            <div>
                <Webcam 
                    ref={webcamRef}
                    videoConstraints={videoConstraints} 
                    mirrored={mirrored} 
                    onLoadedData={handleVideoLoad}
                    style={{position: "absolute", top: 0, left: 0}}
                />
                <button  className="btn btn-warning" onClick={() => meshActive.current = !meshActive.current} 
                         style={{position: 'absolute', top: videoSize.height + 10, left: 0}}>
                    Toggle Face Mesh
                </button> 
                <button className="btn btn-warning" 
                        onClick={handleMirror}
                        style={{marginTop: videoSize.height + 50}}>Toggle Mirrored</button>
                <canvas id="faceMeshCanvas" style={{
                        position: "absolute", 
                        top: 0, left: 0, 
                        width: videoSize.width, height: videoSize.height}}/>
            </div>
        </div>
    );
}

export default CameraScreen;