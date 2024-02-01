import { Text, SafeAreaView, Button, View } from "react-native";
import { useEffect, useState } from "react";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import styles from "../styles";
import ButtonColumn from "../components/ButtonColumn";
import Separator from "../components/Separator";


function SelectScreen ({navigation}) {
    // const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()

    const handlePressCanal = (canal: string) => setAffectedCanal(canal);
    const handlePressEar = (ear: string) => setAffectedEar(ear);
    const handleNext = () => {if (affectedCanal && affectedEar) {navigation.navigate("Camera")}};
    useEffect(() => {
        navigation.addListener('focus', () => {
            setAffectedCanal("")
            setAffectedEar("")
        });
    }, []);

    const [affectedCanal, setAffectedCanal] = useState("")
    const [affectedEar, setAffectedEar] = useState("")

    const canals: string[] = ["Anterior", "Posterior", "Lateral"]
    const ears: string[] = ["Left", "Right"]

    return (
            <SafeAreaView style={styles.globalContainer}>
                <View style={styles.container}>
                <Text style={styles.title}>
                    Welcome to the Epley guidance app! Please select the affected canal.
                </Text> 
                <Separator space={8}/>
                <ButtonColumn buttonLabels={canals} onPressButton={handlePressCanal}/>
                <Separator space={8}/>
                <ButtonColumn buttonLabels={ears} onPressButton={handlePressEar}/>
                <Text style={styles.title}>{affectedEar + " " + affectedCanal}</Text>
                </View>
                <View style={{width: 150, height:150, alignSelf: "center"}}>
                    <Button title="Next" color="#e3e311" onPress={handleNext}/>
                </View>

            </SafeAreaView>
    );
}

export default SelectScreen;
