import React, { useState, useEffect } from 'react';
import './DiffiScore.css';

const DiffiScore = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isInitialized, setIsInitialized] = (false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTag, setUploadTag] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      setIsInitialized(data.status === 'ready');
    } catch (error) {
      setErrorMessage('Could not connect to the server');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isInitialized) {
      setErrorMessage('Please initialize the database first');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 3 })
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.results);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      setErrorMessage('Failed to perform search');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>DiffiScore</h1>
        <p>LLM-enhanced Exam Question Management</p>
      </header>
      <div className="main-content">
        <div className="panel">
          <h2>Search Questions</h2>
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Enter a text prompt..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-input"
            />
            <button type="submit" className="button primary-button">Search</button>
          </form>
          <p className="hint-text">Using DeepSeek API for better query interpretation.</p>
        </div>
        <div className="panel">
          <h2>Results</h2>
          <div className="results-grid">
            {searchResults.map((result, index) => (
              <div key={index} className="result-card">
                <img src={`data:image/png;base64,${result.image_data}`} alt={result.tag} className="result-image"/>
                <p>{result.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffiScore;
