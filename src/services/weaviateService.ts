import weaviate, { ApiKey } from 'weaviate-ts-client';
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

      if (this.config.apiKey) {
        clientConfig.apiKey = new ApiKey(this.config.apiKey);
      }

      this.client = weaviate.client(clientConfig);
      console.log('Connected to Weaviate');
    } catch (error) {
      console.error('Failed to connect to Weaviate:', error);
      throw error;
    }
  }

  async searchText(query: string, limit: number = 10, className: string = import.meta.env.VITE_WEAVIATE_COLLECTION || 'ClipArena'): Promise<SearchResults> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized. Call connect() first.');
    }

    try {
      // Perform 4 different searches with different targetVectors
      const searches = await Promise.all([
        this.performTextSearch(query, className, 'metaclip2', limit),
        this.performTextSearch(query, className, 'modernvbert', limit),
        this.performTextSearch(query, className, 'vitb32laion5b', limit),
        this.performTextSearch(query, className, 'siglip2', limit),
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

  async searchImage(base64Image: string, limit: number = 10, className: string = import.meta.env.VITE_WEAVIATE_COLLECTION || 'ClipArena'): Promise<SearchResults> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized. Call connect() first.');
    }

    try {
      // Perform 4 different searches with different targetVectors using nearImage
      const searches = await Promise.all([
        this.performImageSearch(base64Image, className, 'metaclip2', limit),
        this.performImageSearch(base64Image, className, 'modernvbert', limit),
        this.performImageSearch(base64Image, className, 'vitb32laion5b', limit),
        this.performImageSearch(base64Image, className, 'siglip2', limit),
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

  async searchSimilar(objectId: string, limit: number = 10, className: string = import.meta.env.VITE_WEAVIATE_COLLECTION || 'ClipArena'): Promise<SearchResults> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized. Call connect() first.');
    }

    try {
      // Perform 4 different searches with different targetVectors using nearObject
      const searches = await Promise.all([
        this.performSimilarSearch(objectId, className, 'metaclip2', limit),
        this.performSimilarSearch(objectId, className, 'modernvbert', limit),
        this.performSimilarSearch(objectId, className, 'vitb32laion5b', limit),
        this.performSimilarSearch(objectId, className, 'siglip2', limit),
      ]);

      return {
        column1: searches[0],
        column2: searches[1],
        column3: searches[2],
        column4: searches[3],
      };
    } catch (error) {
      console.error('Similar search failed:', error);
      throw error;
    }
  }

  async getImagesByIndexes(indexes: number[], className: string = import.meta.env.VITE_WEAVIATE_COLLECTION || 'ClipArena'): Promise<ImageResult[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized. Call connect() first.');
    }

    try {
      console.log(`Fetching images by indexes: ${indexes.join(', ')}`);

      // Fetch all images with the specified indexes
      const result = await this.client.graphql
        .get()
        .withClassName(className)
        .withWhere({
          operator: 'Or',
          operands: indexes.map(index => ({
            path: ['index'],
            operator: 'Equal',
            valueNumber: index
          }))
        })
        .withFields('_additional { id } index base64_image dataset_name')
        .withLimit(indexes.length)
        .do();

      console.log('Fetched images by indexes:', result);

      const data = result?.data?.Get?.[className] || [];

      return data.map((item: any) => ({
        id: item._additional?.id || Math.random().toString(),
        index: item.index || 0,
        base64_image: item.base64_image || '',
        dataset_name: item.dataset_name || '',
      }));
    } catch (error: any) {
      console.error('Failed to fetch images by indexes:', error);
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      return [];
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
    } catch (error: any) {
      console.error('Text search query failed for targetVector:', targetVector, error);
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      if (error?.message) {
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
    } catch (error: any) {
      console.error('Image search query failed for targetVector:', targetVector, error);
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      return [];
    }
  }

  private async performSimilarSearch(
    objectId: string,
    className: string,
    targetVector: string,
    limit: number = 10
  ): Promise<ImageResult[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      console.log(`Performing similar search for object: "${objectId}" with targetVector: "${targetVector}"`);

      const result = await this.client.graphql
        .get()
        .withClassName(className)
        .withNearObject({
          id: objectId,
          targetVectors: [targetVector]
        })
        .withFields('_additional { id distance } index base64_image dataset_name')
        .withLimit(limit)
        .do();

      console.log('Similar search result:', result);

      const data = result?.data?.Get?.[className] || [];

      return data.map((item: any) => ({
        id: item._additional?.id || Math.random().toString(),
        index: item.index || 0,
        base64_image: item.base64_image || '',
        dataset_name: item.dataset_name || '',
        distance: item._additional?.distance,
      }));
    } catch (error: any) {
      console.error('Similar search query failed for targetVector:', targetVector, error);
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      return [];
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

// Create a singleton instance with your Weaviate configuration from environment variables
const weaviateService = new WeaviateService({
  scheme: import.meta.env.VITE_WEAVIATE_SCHEME || 'http',
  host: import.meta.env.VITE_WEAVIATE_HOST || 'localhost:8080',
  apiKey: import.meta.env.VITE_WEAVIATE_API_KEY,
});

export default weaviateService;
