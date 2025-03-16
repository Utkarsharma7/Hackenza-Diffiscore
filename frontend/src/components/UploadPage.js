import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadPage.css';

const UploadPage = ({ 
  isInitialized, 
  initializeDatabase, 
  errorMessage, 
  setErrorMessage, 
  successMessage, 
  setSuccessMessage, 
  API_BASE_URL 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [uploadTag, setUploadTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Track the current step (1-3)
  const navigate = useNavigate();

  // Handle file upload selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('image/')) {
        setErrorMessage('Please select an image file');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFilePreview(reader.result);
        setCurrentStep(2); // Move to step 2 after image upload
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle upload submission
  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!uploadTag || uploadTag.trim() === '') {
      setErrorMessage('Please enter a tag for the image');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!isInitialized) {
      setErrorMessage('Please initialize the database first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsUploading(true);
    setCurrentStep(3); // Move to step 3

    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('tag', uploadTag);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Image uploaded successfully');
        setTimeout(() => {
          setSuccessMessage('');
          // Reset form after successful upload
          setSelectedFile(null);
          setSelectedFilePreview(null);
          setUploadTag('');
          setCurrentStep(1);
        }, 3000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Failed to upload image: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="search-bar">
        <div className="search-input-container" onClick={() => navigate('/')}>
          <i className="search-icon">🔍</i>
          <div className="search-placeholder">Click to return to search</div>
          <button className="mic-button">🎤</button>
        </div>
      </div>

      <div className="upload-content">
        <div className="step-indicators">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">01</div>
            <div className="step-text">
              <h3>UPLOAD YOUR IMAGE</h3>
              <p>the image should be clear and in jpeg format</p>
            </div>
          </div>
          
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">02</div>
            <div className="step-text">
              <h3>Give the required prompt</h3>
              <p>try to be as accurate as possible</p>
            </div>
          </div>
          
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">03</div>
            <div className="step-text">
              <h3>Await the result....</h3>
              <p>you can download relevant images from the list displayed</p>
            </div>
          </div>
        </div>

        <div className="upload-area">
          <h2>UPLOAD IMAGE HERE</h2>
          
          <div className="upload-preview">
            {selectedFilePreview ? (
              <img 
                src={selectedFilePreview} 
                alt="Image preview" 
                className="preview-image"
              />
            ) : (
              <div className="upload-placeholder" onClick={() => document.getElementById('file-input').click()}>
                <p>Click to select an image</p>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {currentStep >= 2 && (
            <div className="tag-input-section">
              <div className="prompt-box">
                <input
                  type="text"
                  placeholder="Enter tag for this question..."
                  value={uploadTag}
                  onChange={(e) => setUploadTag(e.target.value)}
                  className="tag-input"
                />
              </div>
              <button 
                className="submit-button"
                onClick={handleUploadSubmit}
                disabled={isUploading || !uploadTag.trim()}
              >
                {isUploading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          )}

          {!isInitialized && (
            <div className="initialization-section">
              <button 
                onClick={initializeDatabase}
                className="initialize-button"
              >
                Initialize Database
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
