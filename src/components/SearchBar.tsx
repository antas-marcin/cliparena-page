import React, { useState, useRef } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  onTextSearch: (query: string) => void;
  onImageSearch: (base64Image: string) => void;
  onSimilarMode: () => void;
  onTextMode?: () => void;
  onImageMode?: () => void;
  isLoading?: boolean;
}

type SearchMode = 'text' | 'image' | 'similar';

const SearchBar: React.FC<SearchBarProps> = ({ onTextSearch, onImageSearch, onSimilarMode, onTextMode, onImageMode, isLoading = false }) => {
  const [mode, setMode] = useState<SearchMode>('similar');
  const [query, setQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onTextSearch(query.trim());
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
      onImageSearch(base64);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleTextMode = () => {
    setMode('text');
    if (onTextMode) {
      onTextMode();
    }
  };

  const handleImageMode = () => {
    setMode('image');
    if (onImageMode) {
      onImageMode();
    }
  };

  const handleSimilarMode = () => {
    setMode('similar');
    onSimilarMode();
  };

  return (
    <div className="search-bar-container">
      <div className="search-mode-toggle">
        <button
          type="button"
          className={`mode-button ${mode === 'similar' ? 'active' : ''}`}
          onClick={handleSimilarMode}
          disabled={isLoading}
        >
          Find Similar
        </button>
        <button
          type="button"
          className={`mode-button ${mode === 'image' ? 'active' : ''}`}
          onClick={handleImageMode}
          disabled={isLoading}
        >
          Image Search
        </button>
        <button
          type="button"
          className={`mode-button ${mode === 'text' ? 'active' : ''}`}
          onClick={handleTextMode}
          disabled={isLoading}
        >
          Text Search
        </button>
      </div>

      {mode === 'text' && (
        <form onSubmit={handleTextSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for images..."
            className="search-input"
            disabled={isLoading}
          />
          <button type="submit" className="search-button" disabled={isLoading || !query.trim()}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      )}

      {mode === 'image' && (
        <div className="image-search-container">
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${previewImage ? 'has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseClick}
          >
            {previewImage ? (
              <div className="preview-container">
                <img src={previewImage} alt="Preview" className="preview-image" />
                <p className="drop-text">Drop another image or click to change</p>
              </div>
            ) : (
              <div className="drop-content">
                <div className="upload-icon">📷</div>
                <p className="drop-text">Drop an image here or click to browse</p>
                <p className="drop-subtext">Supports JPG, PNG, GIF</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

    </div>
  );
};

export default SearchBar;
