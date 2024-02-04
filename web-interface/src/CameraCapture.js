import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import './CameraCapture.css';

// This list should match the key names from the backend list in backend/app.py
const styleOptions = ['marvel comics', 'pixar', 'dracula', 'scary', 'zombie', 'creepy doll', 'ghostly', 'vibrant']


const CameraCapture = ({ capturedImage, setCapturedImage, setIsPrintScreen, imgStyle, setImgStyle }) => {
    const coundownTime = 1;

    const webcamRef = useRef(null);
    const [isCaptured, setIsCaptured] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [capturedImageUrl, setCapturedImageUrl] = useState(null);

    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(null);

    const handleStyleChange = (event) => {
        setImgStyle(event.target.value);
    };

    const capture = async () => {
        setShowCountdown(true);
        setCountdown(coundownTime);

        for (let i = coundownTime - 1; i >= 0; i--) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCountdown(i);
        }

        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        setIsCaptured(true);
        setShowCountdown(false);
    };

    const handlePrint = () => {
        setIsPrintScreen(true)
    };

    const retake = () => {
        setCapturedImage(null);
        setCapturedImageUrl(null);
        setIsCaptured(false);
        setIsLoading(true);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    function getLoadingComponent() {
        if (isLoading) {
            return <div className="loading">
                <div className="spinner" />
                <h2 className='loading-text'>Loading camera...</h2>
            </div>
        }
    }

    function getButton() {
        if (isLoading) {
            return;
        }

        return <button onClick={isCaptured ? retake : capture} disabled={showCountdown}
            className={`capture-button contained ${isCaptured ? 'retake-btn' : 'contained'}`}>
            {isCaptured ? 'Retake Picture' : 'Take Picture'}
        </button>
    }

    return (
        <div className="camera-capture">
            {showCountdown &&
                <div>
                    <div className="countdown">{countdown}</div>
                </div>
            }

            {getLoadingComponent()}
            {!isCaptured && <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={600} videoConstraints={{
                facingMode: 'user',
            }} autoPlay className="webcam" onUserMedia={handleLoad} />
            }

            {isCaptured && <img src={capturedImage} alt="captured" className="captured-image" />}

            <div className="button-group">
                {getButton()}
                {isCaptured && (
                    <>
                        <select value={imgStyle} onChange={handleStyleChange} className="style-select">
                            <option value="surprise me">Surprise Me</option>
                            {styleOptions.map((style, index) => (
                                <option key={index} value={style}>{style}</option>
                            ))
                            }
                        </select>

                        <button onClick={handlePrint} className="print-button">
                            Print!
                        </button>
                    </>
                )}
            </div>

            {/* Display the image from the URL received from the backend */}
            {capturedImageUrl && <img src={capturedImageUrl} alt="you hahaha" className="captured-image" />}
        </div>
    );
};

export default CameraCapture;

