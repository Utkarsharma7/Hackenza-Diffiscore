import React, { useState, useEffect } from 'react';
import './DiffiScore.css';

const DiffiScore = () => {
  // State variables
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);

  // API base URL (adjust as needed)
  const API_BASE_URL = 'http://localhost:5000/api';

  // Check database status on component mount
  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  // Check if database is initialized
  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setIsInitialized(data.status === 'ready');
    } catch (error) {
      console.error('Error checking database status:', error);
      setErrorMessage('Could not connect to the server');
    }
  };

  // Initialize database
  const initializeDatabase = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_folder: './images',
          tags: {
            "q1": "sick",
            "q2": "painted",
            "q3": "divisible",
            "q4": "sum",
            "q5": "election"
          }
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsInitialized(true);
        alert('Database initialized successfully');
      } else {
        throw new Error(data.error || 'Initialization failed');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setErrorMessage('Failed to initialize database');
    }
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isInitialized) {
      setErrorMessage('Please initialize the database first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          top_k: 3
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('Failed to perform search');
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // Render image if base64 data exists
  const renderImage = (imageData) => {
    return imageData 
      ? `data:image/png;base64,${imageData}` 
      : '/placeholder-image.png';
  };

  // Handle image download
  const handleDownload = (imageData, fileName) => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = fileName || 'question-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle image expand
  const handleImageExpand = (imageData) => {
    setExpandedImage(imageData);
  };

  // Close expanded image modal
  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>DiffiScore</h1>
        <p>Exam Question Management System</p>
      </header>

      <div className="main-content">
        {/* Search & Upload Section */}
        <div className="panel">
          <div className="section">
            <h2>Search Questions</h2>
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Enter a text prompt..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-input"
              />
              <button 
                type="submit" 
                className="button primary-button"
              >
                Search
              </button>
            </form>
            <div className="hint-text">
              <p>Example prompts:</p>
              <ul>
                <li>Find math questions on integrals</li>
                <li>Show questions about algorithms</li>
              </ul>
            </div>
          </div>

          <div className="section">
            <h2>Upload Question</h2>
            <div className="dropzone">
              <input 
                type="file" 
                onChange={handleFileUpload}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                Drag & Drop Image Here
                <br />or Click to Browse
              </label>
            </div>
            <button className="button success-button">
              Upload
            </button>
          </div>

          {/* Database Initialization */}
          {!isInitialized && (
            <div className="initialization-section">
              <button 
                onClick={initializeDatabase}
                className="button warning-button"
              >
                Initialize Database
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="panel">
          <div className="results-header">
            <h2>
              Results
              {searchResults.length > 0 && 
                ` (${searchResults.length} results for "${query}")`}
            </h2>
            <select className="select-dropdown">
              <option>All Questions</option>
            </select>
          </div>

          {/* Search Results Grid */}
          <div className="results-grid">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="result-card"
              >
                <div className="image-container">
                  <img 
                    src={renderImage(result.image_data)} 
                    alt={result.tag} 
                    className="result-image"
                    onClick={() => handleImageExpand(result.image_data)}
                  />
                </div>
                <div className="result-details">
                  <h3>{result.tag}</h3>
                  <p>Path: {result.image_path}</p>
                  <div className="action-buttons">
                    <button 
                      className="button secondary-button"
                      onClick={() => handleImageExpand(result.image_data)}
                    >
                      View Full Image
                    </button>
                    <button 
                      className="button download-button"
                      onClick={() => handleDownload(result.image_data, result.image_path.split('/').pop())}
                      disabled={!result.image_data}
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {expandedImage && (
        <div className="image-modal" onClick={closeExpandedImage}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close-button" onClick={closeExpandedImage}>&times;</span>
            <img 
              src={`data:image/png;base64,${expandedImage}`} 
              alt="Full size" 
              className="full-image"
            />
            <button 
              className="button download-button modal-download"
              onClick={() => handleDownload(expandedImage, 'question-image.png')}
            >
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffiScore;