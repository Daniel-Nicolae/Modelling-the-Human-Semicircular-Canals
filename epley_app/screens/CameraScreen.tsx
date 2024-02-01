import { Text, SafeAreaView, Button, View } from "react-native";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import styles from "../styles";

function CameraScreen ({navigation}) {
    // const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()

    return (
            <SafeAreaView style={[styles.globalContainer, {justifyContent:"center"}]}>
                <View style={{width: 150, height:100, alignSelf: "center"}}>
                    <Button title="Back" 
                            color="#e3e311"
                            onPress={() => {navigation.navigate("Select")}} />
                </View>
            </SafeAreaView>
    );
}

export default CameraScreen;