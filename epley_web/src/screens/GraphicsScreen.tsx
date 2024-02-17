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
    mirrored: boolean
}

const GraphicsScreen = ({landmarksCallback, ear, canal, mirrored}: Props) => {
    const cameraMode = "p"
    
    const camera = useRef<THREE.Camera>()
    const scene = useRef<THREE.Scene>()
    const renderer = useRef<THREE.WebGLRenderer>()
    const mesh = useRef<THREE.Mesh>()
    useEffect(() => {
        const pi = Math.PI
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
        camera.current.position.set(0, 0, 25)
        camera.current.lookAt(0, 0, 0)

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        ambientLight.castShadow = true
        scene.current.add(ambientLight)

        const pointLight = new THREE.PointLight(0xffffff, 1000)
        pointLight.castShadow = true
        camera.current.add(pointLight);
        scene.current.add(camera.current)

        // Load Canal Mesh
        const loader = new PLYLoader()
        const meshPath = canal + "_mesh.ply"
        // const meshPath = "capsule.ply"
        loader.load(meshPath, (geometry) => {
            geometry.computeVertexNormals()
            geometry.center()

            const material = new THREE.MeshStandardMaterial({color: 0x009cff, side: THREE.DoubleSide})
            const loadedMesh = new THREE.Mesh(geometry, material);

            loadedMesh.castShadow = true;
            loadedMesh.receiveShadow = true;
            mesh.current = loadedMesh
            if (mirrored && ear === "Right" || !mirrored && ear === "Left") mesh.current.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1))
            scene.current!.add(mesh.current)
        })

        // Add ground
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({color: 0xcbcbcb, flatShading: true})
        );
        plane.rotation.x = -pi/2;
        plane.position.y = -10;
        scene.current.add(plane);

        let loop: number = requestAnimationFrame(animate)

        function animate() {
            const landmarks = landmarksCallback()
            if (scene.current!.children.length === 5) scene.current!.children.splice(3, 1) // fix mesh added twice by the useEffect
            if (mesh.current) {
                mesh.current.rotation.set(pi, 0, 0)
                const rotationMatrix = getRotationMatrix(landmarks, ear, canal)
                mesh.current.applyMatrix4(rotationMatrix) 
                renderer.current!.render(scene.current!, camera.current!)
            }
            loop = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(loop) 
            scene.current!.clear()
        }
    }, [ear, canal, mirrored])
   
    

    return (
        <div>
            <canvas id="canalCanvas"/>
        </div>
    );
}

export default GraphicsScreen
