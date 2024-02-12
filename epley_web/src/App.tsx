import React, { useRef, useState } from 'react';

import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';
import Separator from './components/Separator';
import GraphicsScreen from './screens/GraphicsScreen';
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import { videoSize } from './config';

const App = () => {

  const [cameraActive, setCameraActive] = useState(false)
  const [graphicsActive, setGraphicsActive] = useState(false)

  const landmarksRef = useRef<Keypoint[]>([])
  const getLandmarks = () => landmarksRef.current

  const [affectedCanal, setAffectedCanal] = useState("")
  const [affectedEar, setAffectedEar] = useState("")  

  return (
    <div>
      <h3>Welcome to the Epley guidance app! Please select the affected canal.</h3>
      <SelectScreen canalCallback={setAffectedCanal} earCallback={setAffectedEar}/>
      <p>{affectedEar + " " + affectedCanal}</p>
      <Separator space={20}/>
      <button className="btn btn-warning" onClick={() => {if (affectedCanal && affectedEar) setCameraActive(true)}}>Open Camera</button>
      <Separator space={100}/>
      {cameraActive && <CameraScreen landmarksRef={landmarksRef}/>}
      {cameraActive && <button  type="button" className="btn btn-primary" 
                                onClick={() => setGraphicsActive(true)}
                                style={{marginTop: videoSize.height + 20}}>Draw Canal</button> }
      <Separator space={100}/>
      {graphicsActive && <GraphicsScreen canal={affectedCanal} ear={affectedEar} landmarksCallback={getLandmarks}/>}
    </div>
  );
  };

export default App;