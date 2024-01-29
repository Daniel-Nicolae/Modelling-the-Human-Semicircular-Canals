import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  Text,
} from 'react-native';
import styles from './styles'
import ButtonColumn from './components/ButtonColumn';

const App = () => {

  const Separator = () => <View style={styles.separator} />

  const handlePressCanal = (canal: string) => setAffectedCanal(canal);
  const handlePressEar = (ear: string) => setAffectedEar(ear);

  const [affectedCanal, setAffectedCanal] = useState("")
  const [affectedEar, setAffectedEar] = useState("")

  const canals: string[] = ["Anterior", "Posterior", "Lateral"]
  const ears: string[] = ["Left", "Right"]
  
  return (
    <View style={styles.globalContainer}>
    <SafeAreaView style={styles.container}>
      <ButtonColumn buttonLabels={canals} onPressButton={handlePressCanal}/>
      <Separator />
      <ButtonColumn buttonLabels={ears} onPressButton={handlePressEar}/>
      <Text style={styles.text}>{affectedEar + " " + affectedCanal}</Text>
    </SafeAreaView>
    </View>
  );
  };

export default App;