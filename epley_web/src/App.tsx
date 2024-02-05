import React, { useState } from 'react';
import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';
import Separator from './components/Separator';

// import SelectScreen from './screens/SelectScreen';
// import CameraScreen from './screens/CameraScreen';




const App = () => {

  const [cameraActive, setCameraActive] = useState(false)
  const handleCameraActive = () => setCameraActive(true)

  return (
    <div>
      <SelectScreen onNext={handleCameraActive}/>
      <Separator space={100}/>
      {cameraActive && <CameraScreen/>}
    </div>
  );
  };

export default App;