import { useEffect, useRef, useState } from "react"
import { meshPartsLength } from "../utils/Alignment"

interface Props {
    stage: number
    canal: string
    alignmentCallback: () => number
}

const AlignmentDisplay = ({stage, canal, alignmentCallback}: Props) => {
    const [alignment, setAligment] = useState(0)
    const loop = useRef<NodeJS.Timer>()

    useEffect(() => {
        if (loop.current) clearInterval(loop.current)
        if (stage !== meshPartsLength[canal] - 1) 
            loop.current = setInterval(() => setAligment(alignmentCallback()), 100)
    }, [stage])

    return <h4>Alignment: {(alignment*100).toPrecision(4)}%</h4>
}

export default AlignmentDisplay