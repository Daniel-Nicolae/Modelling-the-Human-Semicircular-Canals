import React, { useState } from 'react';
import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';
import Separator from './components/Separator';

// import SelectScreen from './screens/SelectScreen';
// import CameraScreen from './screens/CameraScreen';




const App = () => {

  const [cameraActive, setCameraActive] = useState(false)
  const [modelActive, setModelActive] = useState(false)
  const handleCameraActive = () => setCameraActive(true)
  const handleModelActive = () => setModelActive(true)

  return (
    <div>
      <SelectScreen onNext={handleCameraActive}/>
      <Separator space={100}/>
      <CameraScreen active={cameraActive} onNext={handleModelActive}/>
    </div>
  );
  };

export default App;