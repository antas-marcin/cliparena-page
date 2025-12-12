# Clip Arena - Weaviate Image Search

A React TypeScript application for searching and displaying images from a Weaviate database. Features a clean interface with a search bar and 4-column results display.

## How to install

```shell
uv venv --python 3.13
source .venv/bin/activate
uv pip install -r ./import_data/requirements.txt
```



## Features

- **Search Interface**: Text-based search field for querying images
- **4-Column Layout**: Results displayed in 4 separate columns with different search parameters
- **Weaviate Integration**: Direct connection to Weaviate database for vector search
- **TypeScript**: Fully typed for better development experience
- **Responsive Design**: Adapts to different screen sizes

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running Weaviate instance

## Installation

1. Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

2. Configure Weaviate connection in `src/services/weaviateService.ts`:
   - `scheme`: 'http' or 'https'
   - `host`: Your Weaviate host (e.g., 'localhost:8080' or 'your-instance.weaviate.network')
   - `apiKey`: Optional API key if authentication is required

## Configuration

### Weaviate Service Configuration

Edit `src/services/weaviateService.ts` to configure your Weaviate connection:

```typescript
const weaviateService = new WeaviateService({
  scheme: 'http',
  host: 'localhost:8080', // Update with your Weaviate host
  // apiKey: 'your-api-key-here', // Uncomment if using authentication
});
```

### Search Customization

The application performs 4 different searches with varying certainty thresholds:
- Column 1: 70% certainty
- Column 2: 60% certainty
- Column 3: 50% certainty
- Column 4: 40% certainty

You can modify these in `src/services/weaviateService.ts` in the `search()` method.

### Schema Requirements

The application expects a Weaviate class (default: 'Image') with the following properties:
- `image`: URL or base64 encoded image
- `title`: (optional) Image title
- `description`: (optional) Image description

Update the `className` parameter in the search method if your class has a different name.

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
clip-arena/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx         # Search input component
│   │   ├── SearchBar.css
│   │   ├── ResultsDisplay.tsx    # 4-column results display
│   │   └── ResultsDisplay.css
│   ├── services/
│   │   └── weaviateService.ts    # Weaviate client and queries
│   ├── types/
│   │   └── weaviate.ts           # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── App.css
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── .env.example                  # Example environment variables
└── package.json
```

## Usage

1. Ensure your Weaviate instance is running and accessible
2. Start the application with `npm run dev`
3. Check the connection status indicator (green = connected, red = disconnected)
4. Enter a search query in the search bar
5. View results across 4 columns, each showing different relevance thresholds

## Customization

### Changing the Number of Results

Edit the `performSearch()` method in `src/services/weaviateService.ts`:

```typescript
.withLimit(10) // Change to desired number of results
```

### Modifying Search Fields

Update the fields in the GraphQL query:

```typescript
.withFields('_additional { id certainty } image title description yourCustomField')
```

### Styling

- Global styles: `src/index.css`
- App layout: `src/App.css`
- Search bar: `src/components/SearchBar.css`
- Results display: `src/components/ResultsDisplay.css`

## Troubleshooting

### Connection Failed
- Verify Weaviate is running: `curl http://localhost:8080/v1/.well-known/ready`
- Check host and scheme configuration
- Verify API key if authentication is enabled

### No Results
- Ensure your Weaviate instance has data indexed
- Check the class name matches your schema
- Verify the fields exist in your schema
- Try lowering the certainty threshold

### CORS Issues
- Configure CORS in your Weaviate instance
- Or use a proxy in development

## Technologies Used

- React 18
- TypeScript
- Vite
- Weaviate TypeScript Client
- CSS3
