export interface ImageResult {
  id: string;
  index: number;
  base64_image: string; // base64 encoded image
  dataset_name: string;
  distance?: number;
}

export interface SearchResults {
  column1: ImageResult[];
  column2: ImageResult[];
  column3: ImageResult[];
  column4: ImageResult[];
}

export interface WeaviateConfig {
  scheme: string;
  host: string;
  apiKey?: string;
}
