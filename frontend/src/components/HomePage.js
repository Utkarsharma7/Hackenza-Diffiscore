import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ isInitialized, initializeDatabase, errorMessage, setErrorMessage, API_BASE_URL }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setErrorMessage('Please enter a search query');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!isInitialized) {
      setErrorMessage('Please initialize the database first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      // Store the query in sessionStorage to access it on the results page
      sessionStorage.setItem('searchQuery', query);
      
      // Navigate to results page
      navigate('/results');
    } catch (error) {
      console.error('Search error:', error);
      setErrorMessage('Search failed: ' + error.message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-section">
          <div className="logo-box">
            <img src="/logo.svg" alt="DiffiScore Logo" className="logo" />
          </div>
          <h1 className="title">DIFFISCORE</h1>
          <p className="subtitle">Exam Question Management System</p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <i className="search-icon">🔍</i>
              <input
                type="text"
                placeholder="Search exam questions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
              <button type="button" className="mic-button">🎤</button>
            </div>
          </form>
        </div>

        <div className="navigation-buttons">
          <button onClick={() => navigate('/upload')} className="nav-button">
            Upload Questions
          </button>
          {!isInitialized && (
            <button onClick={initializeDatabase} className="nav-button initialize-button">
              Initialize Database
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
