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
  const [mirrored, setMirrored] = useState(true)

  const landmarksRef = useRef<Keypoint[]>([])
  const getLandmarks = () => [landmarksRef.current[8], landmarksRef.current[230], landmarksRef.current[56],
                              landmarksRef.current[450], landmarksRef.current[258]]
  // Nasion: 8
  // LBO: 230
  // LTO: 56
  // RBO: 450
  // RTO: 258

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
      {cameraActive && <CameraScreen landmarksRef={landmarksRef} mirrored={mirrored} setMirrored={setMirrored}/>}
      {cameraActive && <button  className="btn btn-primary" 
                                onClick={() => setGraphicsActive(true)}>Draw Canal</button> }
      <Separator space={100}/>
      {graphicsActive && <GraphicsScreen canal={affectedCanal} ear={affectedEar} landmarksCallback={getLandmarks} mirrored={mirrored}/>}
    </div>
  );
  };

export default App;