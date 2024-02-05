import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam"

interface Props {
    onNext: () => void
    active: boolean
}

function CameraScreen ({active, onNext}: Props) {
    if (!active) return <></>

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

    // const handleFacesDetected = ({faces}) => {
    //     console.log(faces)s
    // }


    return (
        <div>
            <p>Make sure you can see your face clearly.</p>
            <Webcam videoConstraints={videoConstraints} mirrored={true}/>
            <p/>
            <button type="button" className="btn btn-primary" onClick={onNext}>Load Model</button>
        </div>
    );
}

export default CameraScreen;