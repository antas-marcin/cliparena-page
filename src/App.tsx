import { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import ResultsDisplay from './components/ResultsDisplay';
import weaviateService from './services/weaviateService';
import type { SearchResults } from './types/weaviate.ts';

type LastSearch =
  | { type: 'text'; query: string }
  | { type: 'image'; base64Image: string }
  | { type: 'similar'; imageId: string }
  | null;

function App() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [limit, setLimit] = useState(10);
  const [lastSearch, setLastSearch] = useState<LastSearch>(null);

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

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleTextSearch = async (query: string) => {
    if (!isConnected) {
      setError('Not connected to Weaviate database');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLimit(10);
    setLastSearch({ type: 'text', query });

    try {
      const searchResults = await weaviateService.searchText(query, 10);
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
    setLimit(10);
    setLastSearch({ type: 'image', base64Image });

    try {
      const searchResults = await weaviateService.searchImage(base64Image, 10);
      setResults(searchResults);
    } catch (err) {
      console.error('Image search failed:', err);
      setError('Image search failed. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindSimilar = async (imageId: string) => {
    if (!isConnected) {
      setError('Not connected to Weaviate database');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLimit(10);
    setLastSearch({ type: 'similar', imageId });

    try {
      const searchResults = await weaviateService.searchSimilar(imageId, 10);
      setResults(searchResults);
    } catch (err) {
      console.error('Find similar failed:', err);
      setError('Find similar failed. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowMore = async () => {
    if (!isConnected || !lastSearch) {
      return;
    }

    const newLimit = limit + 10;
    setIsLoading(true);
    setError(null);
    setLimit(newLimit);

    try {
      let searchResults: SearchResults;

      if (lastSearch.type === 'text') {
        searchResults = await weaviateService.searchText(lastSearch.query, newLimit);
      } else if (lastSearch.type === 'image') {
        searchResults = await weaviateService.searchImage(lastSearch.base64Image, newLimit);
      } else {
        searchResults = await weaviateService.searchSimilar(lastSearch.imageId, newLimit);
      }

      setResults(searchResults);
    } catch (err) {
      console.error('Show more failed:', err);
      setError('Failed to load more results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="dark-mode-toggle-container">
        <label className="toggle-switch" title="Toggle dark mode">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <span className="toggle-slider">
            <span className="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
          </span>
        </label>
      </div>

      <header className="app-header">
        <div className="header-content">
          <img src="/logo.png" alt="CLIP Arena" className="app-logo" />
          <p className="app-tagline">CLIP ARENA - Compare & Evaluate CLIP Models</p>
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

      <ResultsDisplay results={results} isLoading={isLoading} onFindSimilar={handleFindSimilar} />

      {results && !isLoading && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={handleShowMore} disabled={isLoading}>
            Show More (+10)
          </button>
          <p className="results-info">Currently showing {limit} results per column</p>
        </div>
      )}

      <footer className="app-footer">
        Powered by Weaviate
      </footer>
    </div>
  );
}

export default App;
