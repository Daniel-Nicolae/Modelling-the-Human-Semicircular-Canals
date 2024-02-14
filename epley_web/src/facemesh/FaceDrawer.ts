import * as THREE from "three"
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import FaceTesselation from "./FaceTesselation";
import { videoSize } from "../config";


export const drawFaceMesh = (canvas: HTMLCanvasElement, landmarks: Keypoint[]) => {
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    ctx.canvas.width = videoSize.width
    ctx.canvas.height = videoSize.height

    // ctx.font = "13px Arial";
    // ctx.fillStyle = "red";
    // ctx.textAlign = "center";
    // landmarks.map((vertex, index) => {
    //     ctx.fillText(index.toString(), vertex.x+10, vertex.y+10); 
    // })

    for (let i = 0; i < FaceTesselation.length / 3; i++) {
        const points = [
            FaceTesselation[i * 3],
            FaceTesselation[i * 3 + 1],
            FaceTesselation[i * 3 + 2],
        ].map((index) => landmarks[index]);
        
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        ctx.lineTo(points[1].x, points[1].y)
        ctx.lineTo(points[2].x, points[2].y)
        ctx.closePath()
        ctx.strokeStyle = "black";
        ctx.stroke()
    }
};