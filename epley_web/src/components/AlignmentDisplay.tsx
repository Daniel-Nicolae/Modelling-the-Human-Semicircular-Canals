import { useEffect, useRef, useState } from "react"
import { meshPartsLength } from "../utils/Alignment"

interface Props {
    stage: number
    canal: string
    stageCallback: (stage: number) => void
    alignmentCallback: () => number
}

const GREEN = "#11bb22"
const BLACK = "#000000"

const AlignmentDisplay = ({stage, canal, stageCallback, alignmentCallback}: Props) => {
    const [alignment, setAligment] = useState(0)
    const [color, setColor] = useState(BLACK)
    const loop = useRef<NodeJS.Timer>()

    useEffect(() => {
        if (loop.current) clearInterval(loop.current)
        let timer = 0
        setColor(BLACK)
        if (stage !== meshPartsLength[canal] - 1 && stage !== 0) 
            loop.current = setInterval(() => {
                const newAlignment = alignmentCallback()
                setAligment(newAlignment)
                if (newAlignment > 0.7) {
                    if (color === BLACK) setColor(GREEN)
                    timer += 0.15
                    if (timer > 5.0) stageCallback((stage + 1) % meshPartsLength[canal]) 
                } else if (timer !== 0.0) {
                        timer = 0.0
                        setColor(BLACK)
                    }
            }, 150)
    }, [stage])

    return <h4 style={{color: color}}>Alignment: {(alignment*100).toFixed(2)}%</h4>
}

export default AlignmentDisplay