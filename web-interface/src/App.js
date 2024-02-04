import React, { useState } from 'react';
import './App.css';
import CameraCapture from './CameraCapture';
import PrintPage from './PrintPage';

function App() {
  const [isPrintScreen, setIsPrintScreen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imgStyle, setImgStyle] = useState('surprise me');

  return (
    <div className="App">
      <header className="App-header">
        <h1>MonsterBooth 🧌</h1>
      </header>
      <main>
        {!isPrintScreen && <CameraCapture capturedImage={capturedImage} setCapturedImage={setCapturedImage} setIsPrintScreen={setIsPrintScreen}
          imgStyle={imgStyle} setImgStyle={setImgStyle} />}
        {isPrintScreen && <PrintPage capturedImg={capturedImage} imgStyle={imgStyle}/>}
      </main>
      <footer>

      </footer>
    </div >
  );
}

export default App;
