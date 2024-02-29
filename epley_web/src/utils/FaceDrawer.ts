import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import FaceTesselation from "./FaceTesselation";


export const drawFaceMesh = (canvas: HTMLCanvasElement, landmarks: Keypoint[]) => {
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.canvas.width = window.innerWidth*0.25
    ctx.canvas.height = window.innerWidth*0.25*3/4

    for (let i = 0; i < FaceTesselation.length / 3; i++) {
        const points = [
            FaceTesselation[i * 3],
            FaceTesselation[i * 3 + 1],
            FaceTesselation[i * 3 + 2],
        ].map((index) => landmarks[index]);
        
        ctx.beginPath()
        ctx.moveTo(points[0].x/2, points[0].y/2)
        ctx.lineTo(points[1].x/2, points[1].y/2)
        ctx.lineTo(points[2].x/2, points[2].y/2)
        ctx.closePath()
        ctx.strokeStyle = "black"
        ctx.stroke()
    }
};