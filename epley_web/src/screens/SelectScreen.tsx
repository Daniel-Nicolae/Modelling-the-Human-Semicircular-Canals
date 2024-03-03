import { MouseEvent } from "react";

import ButtonColumn from "../components/ButtonColumn";
import Separator from "../components/Separator";

interface Props {
    canalCallback: (canal: string) => void
    earCallback: (ear: string) => void
    cameraCallback: () => void
    currentCamera: number
    startedCallback: (started: boolean) => void
    started: boolean
}

function SelectScreen ({canalCallback, earCallback, cameraCallback, currentCamera, startedCallback, started}: Props) {
    const handlePressCanal = (event: MouseEvent) => {
        if (started) return
        const target = event.target as HTMLButtonElement
        canalCallback(target.value)
    }
    const handlePressEar = (event: MouseEvent) => {
        if (started) return
        const target = event.target as HTMLButtonElement
        earCallback(target.value)
        if (target.value === "left" && currentCamera === 0) cameraCallback()
        else if (target.value === "right" && currentCamera === 1) cameraCallback()
    }

    const canals: string[] = ["anterior", "posterior", "lateral"]
    const ears: string[] = ["left", "right"]

    return ( 
        <div>
            <h4 style={{textAlign: "center"}}>Please select <br/> the affected canal</h4>
            <Separator space={8}/>
            <ButtonColumn buttonLabels={canals} onPressButton={handlePressCanal}/>
            <Separator space={8}/>
            <ButtonColumn buttonLabels={ears} onPressButton={handlePressEar}/>
        </div>
    )
}

export default SelectScreen;
