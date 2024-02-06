import React, { useState } from 'react';

import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';
import Separator from './components/Separator';
import GraphicsScreen from './screens/GraphicsScreen';


const App = () => {

  const [cameraActive, setCameraActive] = useState(false)
  const [graphicsActive, setGraphicsActive] = useState(false)
  const handleCameraActive = () => setCameraActive(true)
  const handleGraphicsActive = () => setGraphicsActive(true)

  return (
    <div>
      <SelectScreen onNext={handleCameraActive}/>
      <Separator space={100}/>
      {cameraActive && <CameraScreen onNext={handleGraphicsActive}/>}
      <Separator space={100}/>
      {graphicsActive && <GraphicsScreen/>}
    </div>
  );
  };

export default App;