import { useEffect, useRef, useState } from "react"
import { meshPartsLength } from "../utils/Alignment"
import useSound from "use-sound"

interface Props {
    stage: number
    canal: string
    stageCallback: (stage: number) => void
    alignmentCallback: () => number
    cameraCallback: () => void
}

const GREEN = "#11bb22"
const BLACK = "#000000"
const HIGH_THRESHOLD = 0.95
const LOW_THRESHOLD = 0.9
const DURATION = 5.0

const AlignmentDisplay = ({stage, canal, stageCallback, alignmentCallback, cameraCallback}: Props) => {
    const [displayAlignment, setDisplayAligment] = useState(0.0)
    const [color, setColor] = useState(BLACK)
    const [displayTimer, setDisplayTimer] = useState(0.0)
    const loop = useRef<NodeJS.Timer>()

    const [playAligned] = useSound("sounds/aligned.mp3")
    const [playNotAligned] = useSound("sounds/naligned.mp3")

    useEffect(() => {
        if (loop.current) clearInterval(loop.current)
        let timer = 0
        setColor(BLACK)
        if (stage !== meshPartsLength[canal] - 1 && stage !== 0) 
            loop.current = setInterval(() => {
                const alignment = alignmentCallback()
                setDisplayAligment(alignment)
                if (alignment > HIGH_THRESHOLD) {
                    if (timer === 0.0) {
                        setColor(GREEN)
                        playAligned()
                    }
                    timer += 0.15
                    setDisplayTimer(timer)
                    if (timer > DURATION) {
                        stageCallback((stage + 1) % meshPartsLength[canal]) 
                        if (stage === 1) cameraCallback()
                        timer = 0.0
                        setDisplayTimer(0.0)
                    }
                } 
                else if (alignment < LOW_THRESHOLD && timer !== 0.0) {
                    timer = 0.0
                    setDisplayTimer(0.0)
                    setColor(BLACK)
                    playNotAligned()
                }
            }, 150)
    }, [stage])

    return (
        <div style={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-around"}}>
            <h4 style={{color: color}}>Alignment: {(displayAlignment*100).toFixed(2)}%</h4>
            {displayTimer !== 0.0 && <h4>Keep for {(DURATION - displayTimer).toFixed(2)} seconds.</h4>}
        </div>
    ) 
    
}

export default AlignmentDisplay