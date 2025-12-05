import weaviate from 'weaviate-ts-client';
import type { ImageResult, SearchResults, WeaviateConfig } from '../types/weaviate.ts';

class WeaviateService {
  private client: any = null;
  private config: WeaviateConfig;

  constructor(config: WeaviateConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const clientConfig: any = {
        scheme: this.config.scheme,
        host: this.config.host,
      };

      this.client = weaviate.client(clientConfig);
      console.log('Connected to Weaviate');
    } catch (error) {
      console.error('Failed to connect to Weaviate:', error);
      throw error;
    }
  }

  async searchText(query: string, className: string = 'CitizenBielik'): Promise<SearchResults> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized. Call connect() first.');
    }

    try {
      // Perform 4 different searches with different targetVectors
      const searches = await Promise.all([
        this.performTextSearch(query, className, 'metaclip2', 10),
        this.performTextSearch(query, className, 'modernvbert', 10),
        this.performTextSearch(query, className, 'vitb32laion5b', 10),
        this.performTextSearch(query, className, 'siglip2', 10),
      ]);

      return {
        column1: searches[0],
        column2: searches[1],
        column3: searches[2],
        column4: searches[3],
      };
    } catch (error) {
      console.error('Text search failed:', error);
      throw error;
    }
  }

  async searchImage(base64Image: string, className: string = 'CitizenBielik'): Promise<SearchResults> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized. Call connect() first.');
    }

    try {
      // Perform 4 different searches with different targetVectors using nearImage
      const searches = await Promise.all([
        this.performImageSearch(base64Image, className, 'metaclip2', 10),
        this.performImageSearch(base64Image, className, 'modernvbert', 10),
        this.performImageSearch(base64Image, className, 'vitb32laion5b', 10),
        this.performImageSearch(base64Image, className, 'siglip2', 10),
      ]);

      return {
        column1: searches[0],
        column2: searches[1],
        column3: searches[2],
        column4: searches[3],
      };
    } catch (error) {
      console.error('Image search failed:', error);
      throw error;
    }
  }

  private async performTextSearch(
    query: string,
    className: string,
    targetVector: string,
    limit: number = 10
  ): Promise<ImageResult[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      console.log(`Performing text search with query: "${query}", targetVector: "${targetVector}"`);

      const result = await this.client.graphql
        .get()
        .withClassName(className)
        .withNearText({
          concepts: [query],
          targetVectors: [targetVector]
        })
        .withFields('_additional { id distance } index base64_image dataset_name')
        .withLimit(limit)
        .do();

      console.log('Text search result:', result);

      const data = result?.data?.Get?.[className] || [];

      return data.map((item: any) => ({
        id: item._additional?.id || Math.random().toString(),
        index: item.index || 0,
        base64_image: item.base64_image || '',
        dataset_name: item.dataset_name || '',
        distance: item._additional?.distance,
      }));
    } catch (error) {
      console.error('Text search query failed for targetVector:', targetVector, error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      return [];
    }
  }

  private async performImageSearch(
    base64Image: string,
    className: string,
    targetVector: string,
    limit: number = 10
  ): Promise<ImageResult[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      console.log(`Performing image search with targetVector: "${targetVector}"`);

      const result = await this.client.graphql
        .get()
        .withClassName(className)
        .withNearImage({
          image: base64Image,
          targetVectors: [targetVector]
        })
        .withFields('_additional { id distance } index base64_image dataset_name')
        .withLimit(limit)
        .do();

      console.log('Image search result:', result);

      const data = result?.data?.Get?.[className] || [];

      return data.map((item: any) => ({
        id: item._additional?.id || Math.random().toString(),
        index: item.index || 0,
        base64_image: item.base64_image || '',
        dataset_name: item.dataset_name || '',
        distance: item._additional?.distance,
      }));
    } catch (error) {
      console.error('Image search query failed for targetVector:', targetVector, error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      return [];
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

// Create a singleton instance with your Weaviate configuration
const weaviateService = new WeaviateService({
  scheme: 'http',
  host: '192.168.0.67:8080',
});

export default weaviateService;
