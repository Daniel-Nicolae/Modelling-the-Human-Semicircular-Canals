import { Button, View, Text } from "react-native";
import styles from "../styles";

interface Props {
    buttonLabels: string[]
    onPressButton: (canal: string) => void
}

const Separator = () => <View style={styles.separator} />

function ButtonColumn ({buttonLabels, onPressButton}: Props) {
    const colours: string[] = ["#dd6666", "#66dd66", "#6666dd"]
    return (
        <>
            {buttonLabels.map((item, index) => (
                <>
                <Button key={item} title={item} color={colours[index]} onPress={() => onPressButton(item)} />
                <Separator key={item+10}/>
                </>
            ))}
            
        </>
    );
}

export default ButtonColumn;