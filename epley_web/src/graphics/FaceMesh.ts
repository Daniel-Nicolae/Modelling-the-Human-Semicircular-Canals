import * as THREE from "three"
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import FaceTesselation from "./FaceTesselation";
import { videoSize } from "../config";

const FaceMesh = (landmarks: Keypoint[], mode: string) => {

    const vertices: THREE.Vector3[] = []
    landmarks.map((item, index) => {
        if (mode === "o")
            {vertices.push(new THREE.Vector3(item.x/videoSize.width*2-1, -item.y/videoSize.height*2+1, -10))}
        if (mode === "p")
            {vertices.push(new THREE.Vector3(item.x-videoSize.width/2, -item.y+videoSize.height/2, item.z ? item.z-700 : -10))}
    })

    const geometry = new THREE.WireframeGeometry().setFromPoints(vertices)
    geometry.setIndex(FaceTesselation)

    const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true} );
    const mesh = new THREE.Mesh( geometry, material );

    return mesh
}

export default FaceMesh