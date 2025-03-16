import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import SearchResults from './SearchResults';
import UploadPage from './UploadPage';
import './DiffiScore.css';

function App() {
  // State variables shared across components
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
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
        setSuccessMessage('Database initialized successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Initialization failed');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setErrorMessage('Failed to initialize database');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <HomePage 
              isInitialized={isInitialized}
              initializeDatabase={initializeDatabase}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              API_BASE_URL={API_BASE_URL}
            />
          } />
          <Route path="/upload" element={
            <UploadPage 
              isInitialized={isInitialized}
              initializeDatabase={initializeDatabase}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              successMessage={successMessage}
              setSuccessMessage={setSuccessMessage}
              API_BASE_URL={API_BASE_URL}
            />
          } />
          <Route path="/results" element={
            <SearchResults 
              isInitialized={isInitialized}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              API_BASE_URL={API_BASE_URL}
            />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
