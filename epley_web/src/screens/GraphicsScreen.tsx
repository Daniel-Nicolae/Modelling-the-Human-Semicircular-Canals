import { useEffect } from "react";
import * as THREE from "three";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import { graphicsSize } from "../config";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

interface Props {
    landmarks: Keypoint[]
}

const cameraMode = "p"
const GraphicsScreen = ({landmarks}: Props) => {
    useEffect(() => {
        // Scene initialisation
        const scene = new THREE.Scene()
        scene.background = new THREE.Color( 0x72645b );

        // Camera initialisation
        const initialiseCamera = (cameraMode: string) => {
            if (cameraMode === "o") {
                const camera = new THREE.OrthographicCamera()
                camera.left = -graphicsSize.width/2; camera.right = graphicsSize.width/2;
                camera.bottom = graphicsSize.height/2; camera.top = graphicsSize.height/2;
                return camera
            } else {
                const camera = new THREE.PerspectiveCamera(50, graphicsSize.width/graphicsSize.height)
                return camera
            }
        }
        const camera = initialiseCamera(cameraMode)

        // Renderer
        const canvas = document.getElementById("canalCanvas") as HTMLCanvasElement
        const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
        renderer.setSize(graphicsSize.width, graphicsSize.height)
        document.body.appendChild(renderer.domElement)
    
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        ambientLight.castShadow = true
        scene.add(ambientLight)

        const pointLight = new THREE.PointLight(0xffffff, 700)
        pointLight.castShadow = true
        camera.add(pointLight);
        scene.add(camera)


        // Ground
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({color: 0xcbcbcb, flatShading: true})
        );
        plane.rotation.x = -Math.PI/2;
        plane.position.y = -1;
        scene.add(plane);


        const loader = new PLYLoader()
        let canalMesh: THREE.Mesh
        loader.load("canonical_coloured.ply", (geometry) => {
            const material = new THREE.MeshStandardMaterial({vertexColors: true, roughness: 0.2})
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(0, 0, -25)
            scene.add(mesh)
            canalMesh = mesh
        })
        

        const animate = () => {
            // canalMesh.rotation.z += 0.01
            const timer = Date.now() * 0.0005;
            // scene.children[0].position.z = Math.sin(timer) * 25 + 7
            camera.position.x = Math.sin(timer) * 25 + 7;
            camera.position.z = Math.cos(timer) * 25 - 25;
            camera.lookAt(new THREE.Vector3(7, 8, -25));
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
