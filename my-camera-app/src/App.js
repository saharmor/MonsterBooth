import React from 'react';
import './App.css';
import CameraCapture from './CameraCapture';
import PrintPage from './PrintPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>MonsterBooth</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<CameraCapture />} />
            <Route path="/print" element={<PrintPage />} />
          </Routes>
        </main>
        <footer>
          Made with love in SF
        </footer>
      </div>
    </Router>
  );
}

export default App;
