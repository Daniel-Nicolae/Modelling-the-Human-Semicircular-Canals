import { useEffect, useLayoutEffect } from "react"

interface Props {
    stage: number
    canal: string
    ear: string
}

const InstructionsScreen = ({stage, ear, canal}: Props) => {

    useEffect(() => {
        const canvas = document.getElementById("instructionCanvas") as HTMLCanvasElement
        const ctx = canvas.getContext("2d")!
        const instructionImage = new Image()
        instructionImage.src = "instructions/" + stage.toString() + ".jpg"
        instructionImage.onload = () => {
            ctx.clearRect(0, 0, window.innerWidth/2, window.innerHeight)
            ctx.drawImage(instructionImage, 0, 0)
        }
    })

    return <canvas id="instructionCanvas"/>
}

export default InstructionsScreen
