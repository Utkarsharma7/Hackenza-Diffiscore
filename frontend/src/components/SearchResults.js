import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchResults.css'; // You'll need to create this CSS file too

const SearchResults = ({ isInitialized, errorMessage, setErrorMessage, API_BASE_URL }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Load query from session storage on component mount
  useEffect(() => {
    const storedQuery = sessionStorage.getItem('searchQuery');
    if (storedQuery) {
      setQuery(storedQuery);
      performSearch(storedQuery);
    }
  }, []); // Empty dependency array to run once on mount

  // Perform search
  const performSearch = async (searchQuery) => {
    if (!isInitialized) {
      setErrorMessage('Please initialize the database first');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          top_k: 5 // Show more results
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
      setErrorMessage('Failed to perform search: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    }
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

  // Render image if base64 data exists
  const renderImage = (imageData) => {
    return imageData 
      ? `data:image/png;base64,${imageData}` 
      : '/placeholder-image.png';
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
    <div className="results-container">
      <div className="search-bar">
        <div className="search-input-container" onClick={() => navigate('/')}>
          <i className="search-icon">🔍</i>
          <div className="search-placeholder">
            {query ? `Results for "${query}"` : "Click to return to search"}
          </div>
          <button className="mic-button">🎤</button>
        </div>
      </div>

      <div className="results-content">
        <h2 className="results-title">RESULTS</h2>

        {searchResults.length > 0 ? (
          <div className="results-grid">
            {searchResults.map((result, index) => (
              <div key={index} className="result-item">
                <div className="image-container">
                  <img 
                    src={renderImage(result.image_data)} 
                    alt={result.tag || "Search result"}
                    onClick={() => handleImageExpand(result.image_data)}
                  />
                </div>
                <button 
                  className="download-button"
                  onClick={() => handleDownload(result.image_data, result.image_path?.split('/').pop() || 'image.png')}
                >
                  DOWNLOAD
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No results found for "{query}". Try a different search query.</p>
          </div>
        )}

        {!isInitialized && (
          <div className="initialization-message">
            <p>Database is not initialized. Please return to the home page and initialize first.</p>
            <button 
              onClick={() => navigate('/')}
              className="return-button"
            >
              Return to Home
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {expandedImage && (
        <div className="modal-overlay" onClick={closeExpandedImage}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeExpandedImage}>&times;</span>
            <img 
              src={`data:image/png;base64,${expandedImage}`} 
              alt="Full size" 
              className="expanded-image"
            />
            <button 
              className="modal-download-button"
              onClick={() => handleDownload(expandedImage, 'question-image.png')}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
