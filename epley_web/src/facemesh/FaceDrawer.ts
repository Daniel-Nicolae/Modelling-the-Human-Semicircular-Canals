import * as THREE from "three"
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import FaceTesselation from "./FaceTesselation";
import { videoSize } from "../config";


export const drawFaceMesh = (canvas: HTMLCanvasElement, landmarks: Keypoint[]) => {
    // const scene = new THREE.Scene()

    // // Camera initialisation
    // const initialiseCamera = (cameraMode: string) => {
    //     if (cameraMode === "o") {
    //         const camera = new THREE.OrthographicCamera()
    //         camera.left = -videoSize.width/2; camera.right = videoSize.width/2;
    //         camera.bottom = videoSize.height/2; camera.top = videoSize.height/2;
    //         return camera
    //     } else {
    //         const camera = new THREE.PerspectiveCamera(50, videoSize.width/videoSize.height)
    //         return camera
    //     }
    // }
    // const camera = initialiseCamera(cameraMode)

    // // Renderer
    // const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
    // renderer.setSize(videoSize.width, videoSize.height)
    // document.body.appendChild(renderer.domElement)

    // if (landmarks.length !== 0) {
    //     const mesh = getFaceMesh(landmarks, cameraMode)
    //     scene.add(mesh)
    // }
    // renderer.setClearColor(0xffffff, 0);
    // renderer.render(scene, camera)
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.canvas.width = videoSize.width
    ctx.canvas.height = videoSize.height
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < FaceTesselation.length / 3; i++) {
        const points = [
            FaceTesselation[i * 3],
            FaceTesselation[i * 3 + 1],
            FaceTesselation[i * 3 + 2],
        ].map((index) => landmarks[index]);
        
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        ctx.lineTo(points[1].x, points[1].y)
        ctx.lineTo(points[2].x, points[2].y)
        ctx.closePath()
        ctx.strokeStyle = "black";
        ctx.stroke()
    }
};