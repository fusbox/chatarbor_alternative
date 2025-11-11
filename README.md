# Job Seeker Virtual Assistant (ChatArbor clone)

## Overview

The Job Seeker Virtual Assistant is an advanced, AI-powered chatbot designed to assist users of the Rangam/RangamWorks job portal. It leverages the Google Gemini API to provide a natural, helpful, and empathetic conversational experience. The assistant is specifically tailored to answer questions about job searching, career support, resume preparation, and other services offered by Rangam, acting as a reliable first point of contact for job seekers.

The application is built with a modern frontend stack including React, TypeScript, and Vite, and is styled with Tailwind CSS for a responsive and clean user interface.

## Core Features (Current Functionality)

The application is currently a feature-rich, client-side-only proof-of-concept with the following capabilities:

**Conversational AI:** Powered by the gemini-2.5-flash model, the chatbot engages users in natural language. Its persona is defined by a detailed system prompt that instructs it to be a warm, empathetic, and knowledgeable support agent for Rangam.

**Retrieval-Augmented Generation (RAG):** The assistant's knowledge isn't limited to its training data. It uses a local, manageable knowledge base to provide specific, accurate, and context-aware answers related to RangamWorks. Before generating a response, it performs a keyword-based search on its internal documents to ground its answers in factual company information.

**Dynamic Admin Configuration:** A password-less admin panel allows for real-time modification of the chatbot's core "System Prompt." This powerful feature enables tuning the bot's behavior, rules, and persona on the fly without needing to redeploy the application.

**Knowledge Base Management:** The RAG system is supported by a full CRUD (Create, Read, Update, Delete) interface within the application. An administrator can easily add new documents, edit existing ones, or remove outdated information that the chatbot uses for context.

**Streaming Responses:** To enhance user experience, the chatbot's responses are streamed in real-time, providing immediate feedback and a more dynamic interaction.

**Voice Input (Dictation):** The chat input supports voice-to-text using the browser's built-in Web Speech API, offering an accessible alternative to typing.

**Response Feedback System:** Users can rate the quality of the chatbot's responses. This opens a detailed feedback modal based on a comprehensive rubric (e.g., Accuracy, Relevance, Tone). The collected data is currently logged to the console, structured and ready for future backend integration.

**Local Persistence:** Both the system prompt and the knowledge base documents are saved to the browser's localStorage, ensuring that configurations and data persist between sessions.

## Technology Stack

**Frontend Framework:** React, TypeScript
**Build Tool:** Vite
**AI Model:** Google Gemini API (@google/genai SDK)
**Styling:** Tailwind CSS
**Speech Recognition:** Web Speech API

## Project Roadmap (Future Development)

While the current application is a robust demonstration, the following roadmap outlines key areas for expansion to make it a production-ready enterprise tool.

### Phase 1: Backend Integration & Data Persistence

**Centralized Database:** Migrate the Knowledge Base and System Prompt from localStorage to a proper backend database (e.g., PostgreSQL, Firestore). This will centralize knowledge and configuration for all users.

**Feedback & Analytics API:** Create an API endpoint to store user feedback. This data is critical for analytics, identifying response weaknesses, and fine-tuning the model.

**User Authentication:** Implement a secure authentication system to allow users to save and view their chat history.

### Phase 2: AI & RAG Enhancements

**Vector-Based RAG:** Upgrade the current keyword-based retriever to a sophisticated vector similarity search. This will involve:

* Generating embeddings for all knowledge base documents.
* Using a vector database (like Pinecone, Weaviate, or  pgvector) to find the most semantically relevant documents for a user's query.

This will dramatically improve the accuracy and relevance of the RAG system.

**Implement Function Calling:** Leverage Gemini's function calling capabilities to make the assistant more interactive. For example, instead of just providing a link, the bot could:
searchJobs(location, title): Call an internal API to fetch and display job listings directly in the chat.

**scheduleAppointment():** Integrate with a calendar system to book meetings with career advisors.

**Improve Conversational Memory:** Implement a more robust strategy for managing long-term conversational context, allowing the bot to remember key details from earlier in the conversation.

### Phase 3: UI/UX & Feature Expansion

**Full Markdown Rendering:** Enhance the chat message component to render full Markdown, including lists, bold/italic text, and tables, for richer, more readable responses.

**Conversation History:** With authentication in place, build a UI for users to browse, search, and continue past conversations.

**Accessibility (A11y) Audit:** Conduct a comprehensive accessibility audit to ensure the application is fully usable for all users, including those relying on screen readers and keyboard navigation.

**Internationalization (i18n):** Add support for multiple languages, both for the UI and for the AI model's responses.

### Phase 4: DevOps & Deployment

**Containerization:** Dockerize the application for consistent, isolated, and scalable deployments.

**CI/CD Pipeline:** Set up an automated CI/CD pipeline (e.g., using GitHub Actions) to lint, test, and deploy the application on every push to the main branch.


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1AqIw2bbQazc-dHNd2JWRWXaSwY1btjeJ

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
