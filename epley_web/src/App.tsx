import React, { useState } from 'react';

import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';
import Separator from './components/Separator';
import GraphicsScreen from './screens/GraphicsScreen';
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"

const App = () => {

  const [cameraActive, setCameraActive] = useState(false)
  const [graphicsActive, setGraphicsActive] = useState(false)
  const handleCameraActive = () => setCameraActive(true)
  const handleGraphicsActive = () => setGraphicsActive(true)

  const [landmarks, setLandmarks] = useState<Keypoint[]>([])


  return (
    <div>
      <SelectScreen onNext={handleCameraActive}/>
      <Separator space={100}/>
      {cameraActive && <CameraScreen onNext={handleGraphicsActive} onDetection={setLandmarks}/>}
      <Separator space={100}/>
      {graphicsActive && <GraphicsScreen landmarks={landmarks}/>}
    </div>
  );
  };

export default App;