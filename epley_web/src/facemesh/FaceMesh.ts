import * as THREE from "three"
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import FaceTesselation from "./FaceTesselation";
import { videoSize } from "../config";

export const getFaceMesh = (landmarks: Keypoint[], mode: string) => {
    const vertices: THREE.Vector3[] = []
    landmarks.map((item, index) => {
        if (mode === "o")
            {vertices.push(new THREE.Vector3(item.x/videoSize.width*2-1, -item.y/videoSize.height*2+1, -10))}
        if (mode === "p")
            {vertices.push(new THREE.Vector3(item.x-videoSize.width/2, -item.y+videoSize.height/2, item.z ? item.z-530 : -10))}
    })

    const geometry = new THREE.WireframeGeometry().setFromPoints(vertices)
    geometry.setIndex(FaceTesselation)

    const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true} );
    const mesh = new THREE.Mesh( geometry, material );
    return mesh
}

export const drawFaceMesh = (canvas: HTMLCanvasElement, landmarks: Keypoint[], cameraMode: string) => {
    if (canvas) {
        // var ctx = canvas.getContext('2d')!;
        // ctx.rect(0, 0, 100, 100);
        // ctx.lineWidth = 6;
        // ctx.strokeStyle = "red";
        // ctx.stroke();

        const scene = new THREE.Scene()

        // Camera initialisation
        const initialiseCamera = (cameraMode: string) => {
            if (cameraMode === "o") {
                const camera = new THREE.OrthographicCamera()
                camera.left = -videoSize.width/2; camera.right = videoSize.width/2;
                camera.bottom = videoSize.height/2; camera.top = videoSize.height/2;
                return camera
            } else {
                const camera = new THREE.PerspectiveCamera(50, videoSize.width/videoSize.height)
                return camera
            }
        }
        const camera = initialiseCamera(cameraMode)

        // Renderer
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
        renderer.setClearColor(0xffffff, 0);

        const animate = () => {
            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()


    }
}
