# Job Seeker Virtual Assistant

This repository contains a proof-of-concept for an AI-powered chat application designed to assist job seekers. It features a React-based frontend, a Hono backend running on Cloudflare Workers, and a Retrieval-Augmented Generation (RAG) pipeline for answering user queries.

## Current State

The application is a unified full-stack application, with the backend serving the frontend. The chat functionality is powered by a RAG pipeline that uses Cloudflare Vectorize for the vector database and Cloudflare AI for embeddings and language models.

The application also includes an admin interface for managing the knowledge base and system prompts. The knowledge base can be updated by uploading documents (`.docx`, `.txt`, `.pdf`) or by adding plain text.

## Architecture

*   **Frontend**: The frontend is a React application built with TypeScript and Vite. It is located in the `frontend` directory.
*   **Backend**: The backend is a Hono application running on Cloudflare Workers. It is located in the `backend` directory.
*   **Vector Database**: The application uses Cloudflare Vectorize as its vector database.
*   **AI**: The application uses Cloudflare AI for generating embeddings and language models.

## Install and Run Instructions

1.  **Install Dependencies**:
    *   Navigate to the `frontend` directory and run `npm install`.
    *   Navigate to the `backend` directory and run `npm install --legacy-peer-deps`.

2.  **Configure Cloudflare**:
    *   Rename `backend/wrangler.jsonc.example` to `backend/wrangler.jsonc`.
    *   Update the `wrangler.jsonc` file with your Cloudflare account ID and the ID of your Vectorize index.
    *   Update the `vars` section with your Cloudflare AI API key and base URL.

3.  **Run the Application**:
    *   Navigate to the `backend` directory and run `npm run dev`.
    *   The application will be available at `http://localhost:3000`.

## Future Considerations

*   **URL Processing**: The ability to process and embed content from URLs was removed due to a technical issue with `jsdom` in the Cloudflare Workers environment. This functionality could be re-added in the future by using a different HTML parsing library or by using a dedicated service for this task.
*   **Testing**: The application currently has no tests. Adding a test suite would improve the quality and reliability of the codebase.
*   **Admin UI**: The admin UI is currently basic. It could be improved by adding features like a document viewer, a more advanced editor for system prompts, and analytics on chat sessions.
*   **Deployment**: The application is designed to be deployed on Cloudflare Workers. The deployment process can be streamlined by adding a CI/CD pipeline.
