import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './CameraCapture.css';

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCaptured(true);
  }, [webcamRef]);

  const handlePrint = () => {
    window.location.href = '/print';
  };

  const retake = () => {
    setCapturedImage(null);
    setIsCaptured(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="camera-capture">
      {isLoading && (
        <div className="loading">
          <div className="spinner" />
          <p>Loading camera...</p>
        </div>
      )}
      {isCaptured ? (
        <img src={capturedImage} alt="captured" className="captured-image" />
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={800}
          videoConstraints={{
            facingMode: 'user',
          }}
          autoPlay
          className="webcam"
          onUserMedia={handleLoad}
        />
      )}
      <div className="button-group">
        <button
          onClick={isCaptured ? retake : capture}
          className={`capture-button contained ${isCaptured ? 'retake-btn' : 'contained'}`}
        >
          {isCaptured ? 'Retake Picture' : 'Take Picture'}
        </button>
        {isCaptured && (
          <button onClick={handlePrint} className="print-button">
            Print!
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
