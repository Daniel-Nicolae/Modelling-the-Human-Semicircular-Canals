import { MouseEvent } from "react";

import ButtonColumn from "../components/ButtonColumn";
import Separator from "../components/Separator";

interface Props {
    canalCallback: (canal: string) => void
    earCallback: (ear: string) => void
}

function SelectScreen ({canalCallback, earCallback}: Props) {
    const handlePressCanal = (event: MouseEvent) => {
        const target = event.target as HTMLButtonElement;
        canalCallback(target.value);
    }
    const handlePressEar = (event: MouseEvent) => {
        const target = event.target as HTMLButtonElement;
        earCallback(target.value);
    }

    const canals: string[] = ["Anterior", "Posterior", "Lateral"]
    const ears: string[] = ["Left", "Right"]

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
