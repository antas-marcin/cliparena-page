import React from 'react';
import type { SearchResults, ImageResult } from '../types/weaviate.ts';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: SearchResults | null;
  isLoading?: boolean;
}

const ImageCard: React.FC<{ image: ImageResult }> = ({ image }) => {
  return (
    <div className="image-card">
      <div className="image-wrapper">
        <img src={`data:image/png;base64,${image.base64_image}`} alt={`${image.dataset_name} - ${image.index}`} />
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

const ResultColumn: React.FC<{ images: ImageResult[]; modelName: string }> = ({
  images,
  modelName,
}) => {
  return (
    <div className="result-column">
      <h2 className="column-header">{modelName}</h2>
      <div className="images-container">
        {images.length === 0 ? (
          <p className="no-results">No results found</p>
        ) : (
          images.map((image) => <ImageCard key={image.id} image={image} />)
        )}
      </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading = false }) => {
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
      <ResultColumn images={results.column1} modelName="MetaCLIP2" />
      <ResultColumn images={results.column2} modelName="ModernVBERT" />
      <ResultColumn images={results.column3} modelName="ViT-B/32 LAION-5B" />
      <ResultColumn images={results.column4} modelName="SigLIP2" />
    </div>
  );
};

export default ResultsDisplay;
