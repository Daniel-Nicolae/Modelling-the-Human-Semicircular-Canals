import { useEffect } from "react";
import * as THREE from "three";
import { getFaceMesh } from "../graphics/FaceMesh";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import { videoSize } from "../config";

interface Props {
    landmarks: Keypoint[] 
}

const cameraMode = "o"

const GraphicsScreen = ({landmarks}: Props) => {
    useEffect(() => {
        // Scene initialisation
        const scene = new THREE.Scene()

        // Camera initialisation
        const initialiseCamera = (cameraMode: string) => {
            if (cameraMode === "o") {
                const camera = new THREE.OrthographicCamera()
                camera.left = -videoSize.width/2; camera.right = videoSize.width/2;
                camera.bottom = videoSize.height/2; camera.top = videoSize.height/2;
                return camera
            } else {
                const camera = new THREE.PerspectiveCamera(50)
                return camera
            }
        }
        const camera = initialiseCamera(cameraMode)

        // Renderer
        const canvas = document.getElementById("canalCanvas") as HTMLCanvasElement
        const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
        renderer.setSize(videoSize.width, videoSize.height)
        document.body.appendChild(renderer.domElement)
    
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1)
        ambientLight.castShadow = true
        scene.add(ambientLight)

        if (landmarks.length !== 0) {
            const mesh = getFaceMesh(landmarks, cameraMode)
            scene.add(mesh)
        }

        const animate = () => {
            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()

    }, [landmarks])

    return (
        <div>
            <canvas id="canalCanvas"/>
        </div>
    );
}

export default GraphicsScreen
