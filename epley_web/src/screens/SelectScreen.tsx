import { MouseEvent } from "react";

import ButtonColumn from "../components/ButtonColumn";
import Separator from "../components/Separator";

interface Props {
    canal: string
    canalCallback: (canal: string) => void
    ear: string
    earCallback: (ear: string) => void
    cameraCallback: () => void
    currentCamera: number
    startedCallback: (started: boolean) => void
    started: boolean
}

function SelectScreen ({canal, canalCallback, ear, earCallback, cameraCallback, currentCamera, startedCallback, started}: Props) {

    function fixCamera(ear: string, canal: string) {
        if (canal === "posterior" && ear === "left" && currentCamera === 0) cameraCallback()
        if (canal === "posterior" && ear === "right" && currentCamera === 1) cameraCallback()
        if (canal === "anterior" && ear === "right" && currentCamera === 0) cameraCallback()
        if (canal === "anterior" && ear === "left" && currentCamera === 1) cameraCallback()
    }

    const handlePressCanal = (event: MouseEvent) => {
        if (started) return
        const target = event.target as HTMLButtonElement
        canalCallback(target.value)
        fixCamera(ear, target.value)
    }
    const handlePressEar = (event: MouseEvent) => {
        if (started) return
        const target = event.target as HTMLButtonElement
        earCallback(target.value)
        fixCamera(target.value, canal)
    }

    const canals: string[] = ["anterior", "posterior", "lateral"]
    const ears: string[] = ["left", "right"]

    return ( 
        <div>
            <h4 style={{textAlign: "center"}}>Please select <br/> the affected canal</h4>
            <Separator space={8}/>
            <ButtonColumn buttonLabels={canals} onPressButton={handlePressCanal} bgColor="#ffbb33" color="#000000"/>
            <Separator space={8}/>
            <ButtonColumn buttonLabels={ears} onPressButton={handlePressEar} bgColor="#0022aa" color="#ffffff"/>
        </div>
    )
}

export default SelectScreen;
