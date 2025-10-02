# TTMC Quiz - Static Website Generator

## Project Overview

This project is a static website generator for a quiz application called "Tu Te Mets Combien" (TTMC). It takes quiz content defined in YAML files, converts Markdown-formatted questions and answers into HTML, and then renders them into a series of static HTML pages using Jinja2 templates.

A key feature of the build process is an automated accessibility audit using `@axe-core/cli` to ensure the generated site meets WCAG standards.

**Key Technologies:**
*   **Python:** For the main build script (`build.py`).
*   **PyYAML & Jinja2:** For parsing content and rendering HTML.
*   **Markdown:** For writing quiz questions and answers.
*   **Node.js/npm:** For frontend dependencies and accessibility testing.
*   **Picnic CSS:** A lightweight CSS framework for styling.

## Local Development

Follow these steps to build and run the project locally without Docker.

### 1. Prerequisites
*   Python 3.x
*   Node.js and npm
*   `uv` (or a standard Python virtual environment tool)

### 2. Installation
Install Python and Node.js dependencies:
```bash
# Install Python packages
uv pip install -r requirements.txt

# Install Node.js packages
npm install
```

### 3. Building the Site
Run the build script to generate the static files in the `dist/` directory.
```bash
uv run build.py
```
The build will fail if any accessibility issues are detected.

### 4. Running Locally
After a successful build, you can serve the site with a simple HTTP server:
```bash
uv run -m http.server --directory dist
```
The site will be available at `http://localhost:8000`.

## Deployment with Docker / Podman

You can also run the application in a container using the official Nginx image, which is simpler for local development.

### 1. Prerequisites
*   Docker or Podman installed.
*   The site must be built first by running `uv run build.py`. This will generate the static files in the `dist/` directory.

### 2. Run the Container
Run the Nginx container, mounting the local `dist` directory into the container's webroot and mapping a local port (e.g., 8080) to the container's port 80.

**For Docker:**
```bash
docker run -d -p 8080:80 --name ttmc-quiz-container -v "$(pwd)/dist":/usr/share/nginx/html:ro nginx
```

**For Podman:**
```bash
podman run -d -p 8080:80 --name ttmc-quiz-container -v "$(pwd)/dist":/usr/share/nginx/html:ro nginx
```

The application will then be accessible at `http://localhost:8080`. The `:ro` flag mounts the directory in read-only mode, which is a good security practice.
