import { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import weaviateService from './services/weaviateService';
import type { SearchResults } from './types/weaviate.ts';

function App() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWeaviate = async () => {
      try {
        await weaviateService.connect();
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to connect to Weaviate:', err);
        setError('Failed to connect to Weaviate. Please check your configuration.');
      }
    };

    initWeaviate();
  }, []);

  const handleTextSearch = async (query: string) => {
    if (!isConnected) {
      setError('Not connected to Weaviate database');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await weaviateService.searchText(query);
      setResults(searchResults);
    } catch (err) {
      console.error('Text search failed:', err);
      setError('Text search failed. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async (base64Image: string) => {
    if (!isConnected) {
      setError('Not connected to Weaviate database');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await weaviateService.searchImage(base64Image);
      setResults(searchResults);
    } catch (err) {
      console.error('Image search failed:', err);
      setError('Image search failed. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>CLIP Arena</h1>
        <div className="connection-status">
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </header>

      <SearchBar
        onTextSearch={handleTextSearch}
        onImageSearch={handleImageSearch}
        isLoading={isLoading}
      />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <ResultsDisplay results={results} isLoading={isLoading} />

      <footer className="app-footer">
        Powered by Weaviate
      </footer>
    </div>
  );
}

export default App;
