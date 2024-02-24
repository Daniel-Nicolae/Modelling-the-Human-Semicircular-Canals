import * as THREE from "three";

export const meshPartsLength: {[key: string]: number} = {posterior: 5, lateral: 0, anterior: 0}

const meshPartsEnds: {[key: string]: number[]} = {
    posterior: [2, 420, 145, 337, 531, 49],
    anterior: [],
    lateral: []
}

export function getAlignment (canal: string, stage: number, mesh: THREE.Mesh) {

    if (stage === 0 || stage === meshPartsLength[canal] - 1) return 0

    const top = new THREE.Vector3()
    top.set(
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage-1)]],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage-1)] + 1],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage-1)] + 2]
    )
    const bottom = new THREE.Vector3()
    bottom.set(
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage-1)+1]],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage-1)+1] + 1],
        mesh.geometry.attributes.position.array[3 * meshPartsEnds[canal][2*(stage-1)+1] + 2]
    )
    mesh.localToWorld(top)
    mesh.localToWorld(bottom)

    return (top.y - bottom.y)/top.distanceTo(bottom)

}


