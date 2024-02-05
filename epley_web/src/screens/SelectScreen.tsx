import { useEffect, useState, MouseEvent } from "react";

import ButtonColumn from "../components/ButtonColumn";
import Separator from "../components/Separator";

interface Props {
    onNext: () => void
}

function SelectScreen ({onNext}: Props) {
    // const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()

    const handlePressCanal = (event: MouseEvent) => {
        const target = event.target as HTMLButtonElement;
        setAffectedCanal(target.value);
    }
    const handlePressEar = (event: MouseEvent) => {
        const target = event.target as HTMLButtonElement;
        setAffectedEar(target.value);
    }
    const handleNext = (event: MouseEvent) => {
        if (affectedCanal && affectedEar) onNext()
    };


    const [affectedCanal, setAffectedCanal] = useState("")
    const [affectedEar, setAffectedEar] = useState("")  

    const canals: string[] = ["Anterior", "Posterior", "Lateral"]
    const ears: string[] = ["Left", "Right"]

    return ( 
        <div>
            <p>Welcome to the Epley guidance app! Please select the affected canal.</p>
            <Separator space={8}/>
            <ButtonColumn buttonLabels={canals} onPressButton={handlePressCanal}/>
            <Separator space={8}/>
            <ButtonColumn buttonLabels={ears} onPressButton={handlePressEar}/>
            <p>{affectedEar + " " + affectedCanal}</p>
            <Separator space={20}/>
            <button className="btn btn-warning" onClick={handleNext}>Next</button>
        </div>
            // <SafeAreaView style={styles.globalContainer}>
            //     <View style={styles.container}>
            //     <Text style={styles.title}>
            //         Welcome to the Epley guidance app! Please select the affected canal.
            //     </Text> 
            //     <Separator space={8}/>
            //     <ButtonColumn buttonLabels={canals} onPressButton={handlePressCanal}/>
            //     <Separator space={8}/>
            //     <ButtonColumn buttonLabels={ears} onPressButton={handlePressEar}/>
            //     <Text style={styles.title}>{affectedEar + " " + affectedCanal}</Text>
            //     </View>
            //     <View style={{width: 150, height:150, alignSelf: "center"}}>
            //         <Button title="Next" color="#e3e311" onPress={handleNext}/>
            //     </View>
            // </SafeAreaView>
    );
}

export default SelectScreen;
