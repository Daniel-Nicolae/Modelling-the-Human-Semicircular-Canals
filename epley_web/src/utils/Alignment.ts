import * as THREE from "three";

export const meshPartsLength: {[key: string]: number} = {posterior: 5, anterior: 5, lateral: 3}

const meshPartsEnds: {[key: string]: number[]} = {
    posterior: [2, 420, 128, 356, 531, 49],
    anterior: [306, 372, 492, 128, 167, 229],
    lateral: [289, 510, 322, 330, 410, 74]
}

export function getAlignment (canal: string, stage: number, mesh: THREE.Mesh) {

    if (canal === "posterior" || canal === "anterior") {
        if (stage === 0 || stage === meshPartsLength[canal] - 1) return 0
        stage -= 1
    }

    const top = new THREE.Vector3()
    top.set(
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage)]],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage)] + 1],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage)] + 2]
    )
    const bottom = new THREE.Vector3()
    bottom.set(
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage)+1]],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage)+1] + 1],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage)+1] + 2]
    )
    mesh.localToWorld(top)
    mesh.localToWorld(bottom)

    return (top.y - bottom.y)/top.distanceTo(bottom)

}


