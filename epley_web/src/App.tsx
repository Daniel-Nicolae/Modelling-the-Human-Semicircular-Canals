import { useRef, useState } from 'react';

import SelectScreen from './screens/SelectScreen';
import CameraScreen from './screens/CameraScreen';
import Separator from './components/Separator';
import GraphicsScreen from './screens/GraphicsScreen';
import { Keypoint } from "@tensorflow-models/face-landmarks-detection"
import InstructionsScreen from './screens/InstructionsScreen';
import { meshPartsLength } from './utils/Alignment';

const App = () => {

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

  const [started, setStarted] = useState(false)
  const handleStarted = () => {
      if (!started) setStarted(true) 
      setStage((stage + 1) % meshPartsLength[affectedCanal])
  }

  const meshActive = useRef(false)
  const meshActiveCallback = () => meshActive.current

  const [stage, setStage] = useState(0) 

  const loopRef = useRef<NodeJS.Timer>()
  const [currentCamera, setCurrentCamera] = useState(0) // 0 is right and 1 is left
  const [cameraIDs, setCameraIDs] = useState<string[]>([])
  const handleToggleCamera = () => {
      if (loopRef.current) clearInterval(loopRef.current)
      setCurrentCamera((currentCamera + 1) % 2)
  }
  const fixCamera = () => {
      if (loopRef.current) clearInterval(loopRef.current)
      setCameraIDs([cameraIDs[1], cameraIDs[0]])
  }

  return (
    <div style={{display: "flex", flexDirection: "row", width: "100%", height: "100vh"}}>
      <div style={{display: "flex", flexDirection: "column", width: "50%", alignContent: "center"}}>
      <Separator space={5}/>

        <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between"}}>
          <div style={{display: "flex", flexDirection: "column", width: "45%", alignItems: "center"}}>
            <SelectScreen 
                canalCallback={setAffectedCanal} 
                earCallback={setAffectedEar} 
                cameraCallback={handleToggleCamera}
                currentCamera={currentCamera}
                startedCallback={setStarted}
                started={started}
            />
            <h4>{affectedEar} {affectedCanal}</h4>
          </div>
          <CameraScreen 
              landmarksRef={landmarksRef} 
              currentCamera={currentCamera}
              meshActiveCallback={meshActiveCallback}
              loopRef={loopRef}
              cameraIDs={cameraIDs}
              setCameraIDs={setCameraIDs}
          />
        </div>

        <Separator space={5}/>
        <GraphicsScreen 
            landmarksCallback={getLandmarks} 
            canal={affectedCanal} 
            ear={affectedEar} 
            currentCamera={currentCamera}
            cameraCallback={handleToggleCamera}
            stage={stage}
            stageCallback={setStage}/>
        <Separator space={5}/>

        {affectedCanal && affectedEar && 
        <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-around"}}>
          <button className='btn btn-warning' onClick={handleToggleCamera}> Toggle Camera </button>
          <button className='btn btn-warning' onClick={() => {meshActive.current = !meshActive.current}}> Toggle Face Mesh </button>
          <button className='btn btn-warning' onClick={handleStarted}> Start </button>
        </div>}

      </div>
      <div style={{width: "1%"}}/>
      <div style={{display: "flex", flexDirection: "column", width: "50%", alignContent: "center"}}>
        <InstructionsScreen stage={stage} canal={affectedCanal} ear={affectedEar} fixCamera={fixCamera}/>
      </div>

    </div>
  )
  }


export default App;