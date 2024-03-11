import { useEffect } from "react"

interface Props {
    stage: number
    canal: string
    ear: string
    fixCamera: () => void
}

const InstructionsScreen = ({stage, ear, canal, fixCamera}: Props) => {

    useEffect(() => {
        if (!ear || !canal) return
        const canvas = document.getElementById("instructionCanvas") as HTMLCanvasElement
        const ctx = canvas.getContext("2d")!
        const instructionImage = new Image()
        instructionImage.src = "instructions/" + stage.toString() + ".jpg"
        instructionImage.onload = () => {
            ctx.clearRect(0, 0, window.innerWidth/2, window.innerHeight)
            ctx.drawImage(instructionImage, 0, 0)
        }
    }, [stage])

    if (ear && canal) return <canvas id="instructionCanvas"/>
    else return (
        <div style={{height: window.innerWidth/6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
            <h5>Please ensure your external camera is currently running.</h5>
            <h5>If your main camera is running instead, please first press the Toggle Camera button.</h5>
            <br/>
            <button className='btn btn-warning' style={{width: "20%"}} onClick={fixCamera}>Toggle Camera</button>
        </div>
    )

}

export default InstructionsScreen
