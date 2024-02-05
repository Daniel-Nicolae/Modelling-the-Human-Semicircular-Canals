import Separator from "./Separator";
import { MouseEvent } from "react";

interface Props {
    buttonLabels: string[]
    onPressButton: (event: MouseEvent) => void
}

function ButtonColumn ({buttonLabels, onPressButton}: Props) {
    const colours: string[] = ["#dd6666", "#66dd66", "#6666dd"]
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", width: 400}}>
            {buttonLabels.map((item, index) => (
                <div key={index}>
                <button type="button" className="btn btn-primary" style={{backgroundColor: colours[index]}} value={item} onClick={onPressButton}>{item}</button>
                <Separator space={8}/>
                </div>
            ))}
        </div>
    );
}

export default ButtonColumn;