import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import { graphicsSize, videoSize } from "../config";
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import getRotationMatrix from "../facemesh/getRotationMatrix";

interface Props {
    landmarksCallback: () => Keypoint[]
    canal: String
    ear: String
}

const GraphicsScreen = ({landmarksCallback, ear, canal}: Props) => {
    const cameraMode = "p"
    
    let camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;
    const mesh = useRef<THREE.Mesh>()
    useEffect(() => {
        // Renderer initialisation
        const canvas = document.getElementById("canalCanvas")
        renderer = new THREE.WebGLRenderer({canvas: canvas!, antialias: true})
        renderer.setSize(videoSize.width, videoSize.height)
        document.body.appendChild(renderer.domElement) // automatically creates the canvas

        // Scene initialisation
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0x72645b);

        // Camera initialisation
        function initialiseCamera (cameraMode: string) {
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
        camera = initialiseCamera(cameraMode)
        camera.position.set(0, 0, 15)

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        ambientLight.castShadow = true
        scene.add(ambientLight)

        const pointLight = new THREE.PointLight(0xffffff, 700)
        pointLight.castShadow = true
        camera.add(pointLight);
        scene.add(camera)

        // Load Canal Mesh
        const loader = new PLYLoader()
        const meshPath = canal + "_mesh.ply"
        loader.load(meshPath, (geometry) => {
            geometry.computeVertexNormals()
            geometry.center()

            const material = new THREE.MeshStandardMaterial({color: 0x009cff, roughness: 0.2, side: THREE.DoubleSide})
            const loadedMesh = new THREE.Mesh(geometry, material);

            loadedMesh.castShadow = true;
            loadedMesh.receiveShadow = true;
            mesh.current = loadedMesh
            scene.add(mesh.current)
        })

        // Add ground
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({color: 0xcbcbcb, flatShading: true})
        );
        plane.rotation.x = -Math.PI/2;
        plane.position.y = -10;
        scene.add(plane);

        animate()
    })
    
    function animate() {
        requestAnimationFrame(animate);
        const landmarks = landmarksCallback()
        if (mesh.current) {
            const rotationMatrix = getRotationMatrix(landmarks, ear, canal)
            mesh.current!.applyMatrix4(rotationMatrix)
        }
        renderer.render(scene, camera)
        if (mesh.current) mesh.current.rotation.set(0, 0, 0)
    }

    

    return (
        <div>
            <canvas id="canalCanvas"/>
        </div>
    );
}

export default GraphicsScreen
