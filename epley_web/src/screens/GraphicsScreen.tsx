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
    
    const camera = useRef<THREE.Camera>()
    const scene = useRef<THREE.Scene>()
    const renderer = useRef<THREE.WebGLRenderer>()
    const mesh = useRef<THREE.Mesh>()
    useEffect(() => {
        // Renderer initialisation
        const canvas = document.getElementById("canalCanvas") as HTMLCanvasElement
        renderer.current = new THREE.WebGLRenderer({canvas: canvas!, antialias: true})
        renderer.current.setSize(videoSize.width, videoSize.height)
        document.body.appendChild(renderer.current.domElement) // automatically creates the canvas

        // Scene initialisation
        scene.current = new THREE.Scene()
        scene.current.background = new THREE.Color(0x72645b);

        // Camera initialisation
        function initialiseCamera (cameraMode: string) {
            if (cameraMode === "o") {
                const camera = new THREE.OrthographicCamera()
                camera.left = -graphicsSize.width/2; camera.right = graphicsSize.width/2;
                camera.bottom = graphicsSize.height/2; camera.top = graphicsSize.height/2;
                return camera
            } else {
                const camera = new THREE.PerspectiveCamera(25, graphicsSize.width/graphicsSize.height)
                return camera
            }
        }
        camera.current = initialiseCamera(cameraMode)
        camera.current.position.set(0, 0, 60)

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        ambientLight.castShadow = true
        scene.current.add(ambientLight)

        const pointLight = new THREE.PointLight(0xffffff, 4000)
        pointLight.castShadow = true
        camera.current.add(pointLight);
        scene.current.add(camera.current)

        // Load Canal Mesh
        const loader = new PLYLoader()
        // const meshPath = canal + "_mesh.ply"
        const meshPath = "capsule.ply"
        loader.load(meshPath, (geometry) => {
            geometry.computeVertexNormals()
            geometry.center()

            const material = new THREE.MeshStandardMaterial({color: 0x009cff, roughness: 0.2, side: THREE.DoubleSide})
            const loadedMesh = new THREE.Mesh(geometry, material);

            loadedMesh.castShadow = true;
            loadedMesh.receiveShadow = true;
            mesh.current = loadedMesh
            scene.current!.add(mesh.current)
        })

        // Add ground
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({color: 0xcbcbcb, flatShading: true})
        );
        plane.rotation.x = -Math.PI/2;
        plane.position.y = -10;
        scene.current.add(plane);

        const loop = animate() 
        
        return () => {
            cancelAnimationFrame(loop) 
            scene.current!.clear()
        }
    }, [])
   
    const pi = Math.PI
    function animate() {
        const loop = requestAnimationFrame(animate);
        const landmarks = landmarksCallback()
        if (scene.current!.children.length === 5) scene.current!.children.splice(3, 1) // fix mesh added twice by the useEffect
        if (mesh.current) {
            mesh.current.rotation.set(0, 0, 0)
            // mesh.current.rotation.y += Math.PI
            const rotationMatrix = getRotationMatrix(landmarks, ear, canal)
            mesh.current.applyMatrix4(rotationMatrix) 
            renderer.current!.render(scene.current!, camera.current!)
        }
        return loop
    }
    

    return (
        <div>
            <canvas id="canalCanvas"/>
        </div>
    );
}

export default GraphicsScreen
