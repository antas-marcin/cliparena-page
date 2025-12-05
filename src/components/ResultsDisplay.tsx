import React from 'react';
import type { SearchResults, ImageResult } from '../types/weaviate.ts';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: SearchResults | null;
  isLoading?: boolean;
  onFindSimilar?: (imageId: string) => void;
}

const ImageCard: React.FC<{ image: ImageResult; onFindSimilar?: (imageId: string) => void }> = ({ image, onFindSimilar }) => {
  return (
    <div className="image-card">
      <div className="image-wrapper">
        <img src={`data:image/png;base64,${image.base64_image}`} alt={`${image.dataset_name} - ${image.index}`} />
        {onFindSimilar && (
          <button
            className="find-similar-btn"
            onClick={() => onFindSimilar(image.id)}
            title="Find similar images"
          >
            🔍 Find Similar
          </button>
        )}
      </div>
      <h3 className="image-title">{image.dataset_name}</h3>
      <p className="image-description">Index: {image.index}</p>
      {image.distance !== undefined && (
        <div className="image-certainty">
          Distance: {image.distance.toFixed(4)}
        </div>
      )}
    </div>
  );
};

const ResultColumn: React.FC<{ images: ImageResult[]; modelName: string; onFindSimilar?: (imageId: string) => void }> = ({
  images,
  modelName,
  onFindSimilar,
}) => {
  return (
    <div className="result-column">
      <h2 className="column-header">{modelName}</h2>
      <div className="images-container">
        {images.length === 0 ? (
          <p className="no-results">No results found</p>
        ) : (
          images.map((image) => <ImageCard key={image.id} image={image} onFindSimilar={onFindSimilar} />)
        )}
      </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading = false, onFindSimilar }) => {
  if (isLoading) {
    return (
      <div className="results-container">
        <div className="loading">Searching for images...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="results-container">
        <div className="no-search">Enter a search query to see results</div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <ResultColumn images={results.column1} modelName="MetaCLIP2" onFindSimilar={onFindSimilar} />
      <ResultColumn images={results.column2} modelName="ModernVBERT" onFindSimilar={onFindSimilar} />
      <ResultColumn images={results.column3} modelName="ViT-B/32 LAION-5B" onFindSimilar={onFindSimilar} />
      <ResultColumn images={results.column4} modelName="SigLIP2" onFindSimilar={onFindSimilar} />
    </div>
  );
};

export default ResultsDisplay;
