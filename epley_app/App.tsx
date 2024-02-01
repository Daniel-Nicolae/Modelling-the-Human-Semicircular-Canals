import React, { useState } from 'react';
import { View, SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import styles from './styles'
import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';


const Stack = createNativeStackNavigator();

const App = () => {

  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Select" screenOptions={{headerShown: false, animation: 'none'}}>
        <Stack.Screen name="Select" component={SelectScreen} options={{title: "Hello"}}/>
        <Stack.Screen name="Camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  };

export default App;