import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../components/model";

interface Props {
    onNext: () => void
    onDetection: (landmarks: Keypoint[]) => void
}

function CameraScreen ({onNext, onDetection}: Props) {

    // const webcamRef = useRef(null);
    const inputResolution = {
        width: 640,
        height: 480,
      };
      
      const videoConstraints = {
        width: inputResolution.width,
        height: inputResolution.height,
        facingMode: "user",
      };

      const [loaded, setLoaded] = useState(false);
      

      const handleVideoLoad = (videoNode: SyntheticEvent) => {
            const video = videoNode.target as HTMLVideoElement
            if (video.readyState !== 4) return;
            if (loaded) return;
            runDetector(video, onDetection); //running detection on video
            setLoaded(true);
        };

    return (
        <div>
            <p>Make sure you can see your face clearly.</p>
            <Webcam videoConstraints={videoConstraints} mirrored={true} onLoadedData={handleVideoLoad}/>
            <p/>
            <button type="button" className="btn btn-primary" onClick={onNext}>Draw Canal</button>
        </div>
    );
}

export default CameraScreen;