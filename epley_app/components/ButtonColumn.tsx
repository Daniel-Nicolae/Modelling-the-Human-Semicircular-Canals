import { Button, View, Text } from "react-native";

import Separator from "./Separator";

interface Props {
    buttonLabels: string[]
    onPressButton: (canal: string) => void
}

function ButtonColumn ({buttonLabels, onPressButton}: Props) {
    const colours: string[] = ["#dd6666", "#66dd66", "#6666dd"]
    return (
        <>
            {buttonLabels.map((item, index) => (
                <>
                <Button title={item} color={colours[index]} onPress={() => onPressButton(item)}/>
                <Separator space={8}/>
                </>
            ))}
        </>
    );
}

export default ButtonColumn;