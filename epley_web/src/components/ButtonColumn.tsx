import Separator from "./Separator";
import { MouseEvent } from "react";

interface Props {
    buttonLabels: string[]
    onPressButton: (event: MouseEvent) => void
    bgColor: string
    color: string
}

function ButtonColumn ({buttonLabels, onPressButton, bgColor, color}: Props) {
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: 400}}>
            {buttonLabels.map((item, index) => (
                <div key={index}>
                <button type="button" className="btn btn-warning" 
                        style={{backgroundColor: bgColor, color: color}}
                        value={item} onClick={onPressButton}>{item}</button>
                <Separator space={8}/>
                </div>
            ))}
        </div>
    );
}

export default ButtonColumn;