import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import getRotationMatrix from "../utils/getRotationMatrix";
import { meshPartsLength, getAlignment } from "../utils/Alignment";
import AlignmentDisplay from "../components/AlignmentDisplay";

interface Props {
    landmarksCallback: () => Keypoint[]
    canal: string
    ear: string
    currentCamera: number
    cameraCallback: () => void
    stage: number
    stageCallback: (stage: number) => void 
}

const GraphicsScreen = ({landmarksCallback, ear, canal, currentCamera, cameraCallback, stage, stageCallback}: Props) => {
    
    const camera = useRef<THREE.Camera>()
    const scene = useRef<THREE.Scene>()
    const renderer = useRef<THREE.WebGLRenderer>()
    const meshParts = useRef<THREE.Mesh[]>([])
    const alignment = useRef(0)

    const ORANGE_COLOUR = 0xffbb33
    const BLUE_COLOUR = 0x0022aa
    const BACKGR_COLOUR = 0xbbaa99

    useEffect(() => {
        const pi = Math.PI
        // Renderer initialisation
        const canvas = document.getElementById("canalCanvas") as HTMLCanvasElement
        renderer.current = new THREE.WebGLRenderer({canvas: canvas!, antialias: true})
		renderer.current.setSize(window.innerWidth*0.5, window.innerHeight*0.5)

        // Scene initialisation
        scene.current = new THREE.Scene()
        scene.current.background = new THREE.Color(BACKGR_COLOUR)

        // Camera initialisation
        camera.current = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight)
        camera.current.position.set(0, 0, 11) 
        camera.current.lookAt(0, 0, 0)

        // Add lights
        const sectionHighlight = new THREE.AmbientLight(ORANGE_COLOUR, 0.8)
        scene.current.add(sectionHighlight)

        const pointLight = new THREE.PointLight(0xffffff, 250)
        pointLight.castShadow = true
        camera.current.add(pointLight);
        scene.current.add(camera.current)

        // Load Canal Mesh
        if (canal && ear) {
            const loader = new PLYLoader()
            for (let i = 0; i < meshPartsLength[canal]; i++) {
                const meshPath = "meshes/" + canal + "_" + i.toString() + ".ply"
                loader.load(meshPath, (geometry) => {

                    const color = (i === stage) ? ORANGE_COLOUR : BLUE_COLOUR
                    const material = new THREE.MeshStandardMaterial({color: color, side: THREE.DoubleSide, flatShading: true})
                    const loadedMesh = new THREE.Mesh(geometry, material);

                    if ((ear === "left" && currentCamera === 0) || (ear === "right" && currentCamera === 1)) 
                        loadedMesh.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1))
                    scene.current!.add(loadedMesh)
                    meshParts.current.push(loadedMesh)
                })
            }
        }

        // Add ground
        // const plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(100, 100),
        //     new THREE.MeshStandardMaterial({color: 0xcbcbcb, flatShading: true})
        // );
        // plane.rotation.x = -pi/2;
        // plane.position.y = -10;
        // scene.current.add(plane);

        let loop: number = requestAnimationFrame(animate)

        function animate() {
            if (meshParts.current[meshPartsLength[canal] - 1]) {
                for (let mesh of meshParts.current) mesh.rotation.set(pi, 0, 0)
                const landmarks = landmarksCallback()
                if (landmarks[0]) {
                    const rotationMatrix = getRotationMatrix(landmarks, ear, canal, currentCamera)
                    for (let mesh of meshParts.current) mesh.applyMatrix4(rotationMatrix) 
                }
                renderer.current!.render(scene.current!, camera.current!)
                alignment.current = getAlignment(canal, stage, meshParts.current[stage])
            }
            loop = requestAnimationFrame(animate)
        }

        return () => {
            cancelAnimationFrame(loop) 
            scene.current!.clear()
            meshParts.current = [] // flush any previous loadings
        }
    }, [ear, canal, stage, currentCamera, landmarksCallback])

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            {ear && canal && <AlignmentDisplay 
                                stage={stage} 
                                canal={canal} 
                                stageCallback={stageCallback}
                                alignmentCallback={() => alignment.current}
                                cameraCallback={cameraCallback}/>}
            <canvas id="canalCanvas"/>
        </div>
    );
}

export default GraphicsScreen
