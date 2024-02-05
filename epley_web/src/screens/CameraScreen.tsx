import { ReactEventHandler, SyntheticEvent, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam"

import { runDetector } from "../components/model";

function CameraScreen () {

    // const webcamRef = useRef(null);
    const inputResolution = {
        width: 500,
        height: 500,
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
            runDetector(video); //running detection on video
            setLoaded(true);
        };


    return (
        <div>
            <p>Make sure you can see your face clearly.</p>
            <Webcam videoConstraints={videoConstraints} mirrored={true} onLoadedData={handleVideoLoad}/>
            <p/>
            <button type="button" className="btn btn-primary" onClick={() => console.log("TODO")}>Draw Canal</button>
        </div>
    );
}

export default CameraScreen;