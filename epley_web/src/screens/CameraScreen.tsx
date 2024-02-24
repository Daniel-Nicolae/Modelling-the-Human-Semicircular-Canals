import { SyntheticEvent, useLayoutEffect, useRef, useState } from "react";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import Webcam from "react-webcam"

import { runDetector } from "../utils/FaceModel";


interface Props {
    landmarksRef: React.MutableRefObject<Keypoint[]>
    currentCamera: number
    meshActiveCallback: () => boolean
    loopRef: React.MutableRefObject<NodeJS.Timer | undefined>
}

function CameraScreen ({landmarksRef, currentCamera, meshActiveCallback, loopRef}: Props) {

    const [cameraIds, setCameraIds] = useState<string[]>([])
    useLayoutEffect(() => {
        async function getDevices() {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const cameras = devices.filter((item) => item.kind === "videoinput")
            setCameraIds(cameras.map((item, index) => item.deviceId))
        }
        getDevices()
    }, [])

    const webcamRef = useRef<Webcam>(null)
    const handleVideoLoad = async (videoNode: SyntheticEvent) => {
        const video = videoNode.target as HTMLVideoElement
        if (video.readyState !== 4) return;
        const canvas = document.getElementById("faceMeshCanvas") as HTMLCanvasElement
        const mirrored = currentCamera === 1
        loopRef.current = await runDetector(video, canvas, mirrored, landmarksRef, meshActiveCallback) //running detection on video
    }

    
    
    if (cameraIds.length === 0) return <></>
    return (
        <>
            <Webcam 
                ref={webcamRef}
                videoConstraints={{
                    width: window.innerWidth*0.25,
                    aspectRatio: 4/3,
                    deviceId: cameraIds[currentCamera]}}
                onLoadedData={handleVideoLoad}
                mirrored={currentCamera === 1}
            />
            <canvas id="faceMeshCanvas"
                    style={{
                        position: "absolute", 
                        top: 5, left: window.innerWidth*0.25, 
                        width: window.innerWidth*0.25, height: window.innerWidth*0.25*3/4}}/>
        </>
    )
}

export default CameraScreen