import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import './PrintPage.css';

const PrintPage = ({ capturedImg }) => {
  const [scaryImageUrl, setScaryImageUrl] = useState(null);
  const [roastText, setRoastText] = useState(null);

  const hasSentApiCall = useRef(false);

  useEffect(() => {
    const sendImages = async () => {
      if (capturedImg && !hasSentApiCall.current) {
        hasSentApiCall.current = true;
        try {
          const scaryImageUrl = await sendImageToAPI(capturedImg);
          if (scaryImageUrl) {
            emailImage(scaryImageUrl);
          }
          sendImageToLlava(capturedImg);
        } catch (error) {
          console.error('Error processing images:', error);
        }
      }
    };
  
    sendImages();
  }, [capturedImg]);

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const emailImage = async (imageUrl) => {
    const data = {
      imgUrl: imageUrl,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/email-img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const sendImageToAPI = async (image) => {
    try {
      // Convert the base64 string to a Blob
      const response = await fetch(image);
      const blob = await response.blob();
  
      // Extract file type from blob
      const fileType = blob.type.split('/')[1];
  
      // Create an image element
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
  
      // Wait for the image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });
  
      // Create a canvas element and set the width and height
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = Math.max(img.width, img.height);
      const scaleFactor = maxDim > 1024 ? 1024 / maxDim : 1; // Change 1024 to your desired maximum dimension
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
  
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      // Convert the canvas content to a Blob with a specific quality
      const compressedBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, `image/${fileType}`, 0.7); // Change 0.7 to your desired quality
      });
  
      // Create a FormData object and append the compressed Blob with a filename
      const formData = new FormData();
      formData.append('file', compressedBlob, `image.${fileType}`);
  
      const apiResponse = await axios.post('https://polaroid-hack-fast-server.vercel.app/scarify_image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Set the image URLs from the response
      setScaryImageUrl(apiResponse.data.scary_image_url);

      console.log('Scary Image URL:', apiResponse.data.scary_image_url);
      return apiResponse.data.scary_image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  
  const sendImageToLlava = async (image) => {
    try {
      // Convert the image URL to a base64 string
      const response = await fetch(image);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;

        // Make the API call
        const apiResponseLlava = await fetch('http://127.0.0.1:5000/roasting', {
          method: 'POST',
          body: JSON.stringify({ image: base64data }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!apiResponseLlava.ok) {
          throw new Error(`HTTP error! status: ${apiResponseLlava.status}`);
        }

        const data = await apiResponseLlava.json();
        setRoastText(data.roast_text);
        speakText(data.roast_text);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };


  return (
    <div className='print-container'>
      {scaryImageUrl && <div className='image-container'>
        <img src={capturedImg} alt="Uploaded" className='uploaded-image' />
        <span className='image-arrow'>➔</span>
        {scaryImageUrl && (
          <img src={scaryImageUrl} alt="Scary" className='scary-image' />
        )}
      </div>
      }
      {!scaryImageUrl && <div className='image-container'>
        <h2 className='images-loading'> Generating scary images 🎃</h2>
      </div>
      }

      <div className='roast-container'>
        <h1 className='roast-title'>Here's what AI thinks of you</h1>
          {roastText && <p className='roast-text'>{roastText}</p>}
          {!roastText && <p className='roast-text-loading'>AI is thinking...</p>}
      </div>
    </div>
  );
};

export default PrintPage;
