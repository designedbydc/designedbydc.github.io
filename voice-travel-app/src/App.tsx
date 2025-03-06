import { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import ResultsDisplay from './components/ResultsDisplay';
import { SearchResult } from './types';
import { mockFlights, mockHotels } from './services/mockData';
import './App.css'

function App() {
  const [results, setResults] = useState<SearchResult | null>(null);

  const handleAnalysis = (analysis: string) => {
    // Mock logic to determine search type and set results
    if (analysis.includes('flight')) {
      setResults({ type: 'flight', data: mockFlights.slice(0, 3) });
    } else if (analysis.includes('hotel')) {
      setResults({ type: 'hotel', data: mockHotels.slice(0, 3) });
    } else {
      setResults(null);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Paytm Travel AI 🤖</h1>
        <p className="app-subtitle">Voice-powered travel search for flights and hotels</p>
      </header>
      
      <main className="app-content">
        <div className="intro-text">
          <h2>Project Holiday 🏝️</h2>
          <p>Simply speak your travel requirements and we'll find the best options for you</p>
        </div>
        
        <VoiceRecorder onAnalysis={handleAnalysis} />
        {results && <ResultsDisplay results={results} />}
      </main>
      
      <footer className="app-footer">
        <p>© 2024 Paytm. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
