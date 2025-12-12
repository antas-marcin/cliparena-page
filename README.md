# Clip Arena - Weaviate Image Search

A React TypeScript application for searching and displaying images from a Weaviate database. Features a clean interface with a search bar and 4-column results display.

## How to install

Start docker compose with Weaviate and vectorizers:

```sh
docker compose up
```

Prepare python environment:

```sh
uv venv --python 3.13
source .venv/bin/activate
uv pip install -r ./import_data/requirements.txt
```

Import data:
```sh
python3 import_data/importer.py 
```

Prepare frontend environment, install dependencies:

```sh
npm install
```

Start the website:

```sh
npm run dev
```

## Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
