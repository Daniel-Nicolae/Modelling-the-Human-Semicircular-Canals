import { Keypoint } from "@tensorflow-models/face-landmarks-detection";
import { Matrix4, Vector3 } from "three";
import { cameraPitch } from "../config";

const normalise = (x: number[]) => {
    const l2 = Math.sqrt(x[0]*x[0] + x[1]*x[1] + x[2]*x[2])
    return [x[0]/l2, x[1]/l2, x[2]/l2]
}

const dotProduct = (x: number[], y: number[]) => {
    return x[0]*y[0] + x[1]*y[1] + x[2]*y[2]
}

const crossProduct = (x: number[], y: number[]) => {
    return [x[1]*y[2] - x[2]*y[1], x[2]*y[0] - x[0]*y[2], x[0]*y[1] - x[1]*y[0]]
}

const getReferenceFrame = ([A, B, C]: Keypoint[]) => {
    let x = normalise([-B.x + A.x, B.y - A.y, B.z! - A.z!])
    let y = [-C.x + A.x, C.y - A.y, C.z! - A.z!]
    const yx = dotProduct(y, x)
    y[0] -= x[0]*yx; y[1] -= x[1]*yx; y[2] -= x[2]*yx;
    y = normalise(y)

    let z = crossProduct(x, y)

    return [x, y, z]
}

const pitch = cameraPitch
const pitchCorrectionMatrix = new Matrix4()
pitchCorrectionMatrix.set(1,  0,                0,               0,
                          0,  Math.cos(pitch),  Math.sin(pitch), 0,
                          0, -Math.sin(pitch),  Math.cos(pitch), 0,
                          0, 0,                 0,               1)

const getRotationMatrix = (landmarks: Keypoint[], ear: String, canal: String, currentCamera: number) => {
    const rotationMatrix = new Matrix4()
    
    const landmarksChosen: number[] = []
    if (canal === "Anterior") landmarksChosen.push(3, 1, 0)
    if (canal === "Posterior") landmarksChosen.push(3, 1, 0)
    if (canal === "Lateral") landmarksChosen.push(3, 1, 0)

    const basis = getReferenceFrame(landmarksChosen.map((item, index) => landmarks[item]))
    const [xVec, yVec, zVec] = basis.map((item, index) => new Vector3(item[0], item[1], item[2]))
    rotationMatrix.makeBasis(xVec, yVec, zVec)

    return rotationMatrix.multiply(pitchCorrectionMatrix)
}

export default getRotationMatrix