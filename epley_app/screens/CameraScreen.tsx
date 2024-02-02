import { Text, SafeAreaView, Button, View } from "react-native";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { Camera, CameraType } from 'expo-camera';
import { useEffect, useRef, useState } from "react";

import styles from "../styles";


function CameraScreen ({navigation}) {
    // const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>()

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean>()
    const [cameraType, setCameraType] = useState(CameraType.front)
    
    useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync()
            setHasCameraPermission(cameraPermission.status === "granted")
        })();
    }, [])

    if (hasCameraPermission === undefined) {return <View style={styles.globalContainer}><Text>Requesting camera permissions...</Text></View>}
    else if (!hasCameraPermission) {return <View style={{alignContent: "center"}}><Text>Camera permissions denied. Please change this in settings.</Text></View>}

    return (
            <SafeAreaView style={[styles.globalContainer, {justifyContent:"center"}]}>
                <Camera
                style={{flex: 1, width:"100%"}}
                ratio="16:9"
                type={cameraType}/>

                <View style={{marginVertical: 10}}/>
                <View style={{width: 250, height:35, alignSelf: "center", flexDirection: "row", justifyContent: "space-evenly"}}>
                    <Button title="Back" 
                            color="#e3e311"
                            onPress={() => {navigation.navigate("Select")}} />
                    <Button title="Change camera"
                            color="#23a1a1"
                            onPress={() => {setCameraType(cameraType === CameraType.front ? CameraType.back : CameraType.front)}}/>
                </View>
                <View style={{height: 50}}/>
            </SafeAreaView>
    );
}

export default CameraScreen;