import { useEffect } from "react";
import * as Three from "three";

const GraphicsScreen = () => {
    useEffect(() => {
        // Scene initialisation
        const scene = new Three.Scene()

        // Camera initialisation
        const camera = new Three.OrthographicCamera()
        camera.left = -20; camera.right = 20;
        camera.bottom = 20; camera.top = 20;

        // const camera = new Three.PerspectiveCamera(50)
        // camera.position.z = 96

        // Renderer
        const canvas = document.getElementById("canalCanvas") as HTMLCanvasElement
        const renderer = new Three.WebGLRenderer({canvas: canvas, antialias: true})
        renderer.setSize(500, 500)
        document.body.appendChild(renderer.domElement)
    
        // Lights
        const ambientLight = new Three.AmbientLight(0xffffff, 1)
        ambientLight.castShadow = true
        scene.add(ambientLight)

        // Content
        const boxGeometry = new Three.BoxGeometry()
        const boxMaterial = new Three.MeshNormalMaterial()
        const boxMesh = new Three.Mesh(boxGeometry, boxMaterial)
        boxMesh.position.set(0, 0, -100)
        scene.add(boxMesh)

        const animate = () => {
            boxMesh.rotation.x += 0.01
            boxMesh.rotation.y += 0.01
            boxMesh.rotation.z += 0.01
            renderer.render(scene, camera)
            window.requestAnimationFrame(animate)
        }
        animate()

    }, [])

    return (
        <div>
            <canvas id="canalCanvas"/>
        </div>
    );
}

export default GraphicsScreen
