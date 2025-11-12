# ChatArbor
An admin dashboard for managing a conversational AI assistant for job seekers, featuring RAG-based knowledge management and response testing.
ChatArbor is a sophisticated administration dashboard for managing a specialized conversational AI assistant designed to help job seekers. The platform empowers administrators to enhance the AI's capabilities through Retrieval-Augmented Generation (RAG). Key features include a Knowledge Base management system for providing the AI with training content (e.g., resume tips, interview strategies, company information), a testing playground to evaluate and refine AI responses in real-time, and a dashboard for monitoring key metrics. The application is built on a serverless Cloudflare architecture, ensuring scalability and performance.
[cloudflarebutton]
## ✨ Key Features
*   **📊 Unified Dashboard:** Get a quick overview of key statistics, including the number of documents in the knowledge base and recent test queries.
*   **📚 Knowledge Base Management:** A full CRUD interface to manage the documents that form the AI's knowledge base, powering the RAG system.
*   **🤖 AI Playground:** An interactive chat interface to test the AI's responses in real-time.
*   **🔍 RAG Context Inspector:** A side panel in the playground reveals the exact context retrieved from the Knowledge Base used to generate a response, allowing for transparent debugging and tuning.
*   **🚀 Serverless Architecture:** Built on Cloudflare Workers and Durable Objects for a scalable, performant, and stateful serverless backend.
## 🛠️ Technology Stack
*   **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/), [Zustand](https://zustand-demo.pmnd.rs/)
*   **Backend:** [Hono](https://hono.dev/) on [Cloudflare Workers](https://workers.cloudflare.com/)
*   **State Management:** [Cloudflare Agents SDK](https://github.com/cloudflare/agents) (built on Durable Objects)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/)
## 🚀 Getting Started
Follow these instructions to get the project up and running on your local machine.
### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Bun](https://bun.sh/)
*   [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) CLI
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chatarbor.git
    cd chatarbor
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. You can copy the structure from `wrangler.jsonc`.
    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```
    Replace the placeholder values with your actual Cloudflare Account ID, Gateway ID, and API Key.
## 🖥️ Development
To start the development server, which includes the Vite frontend and the Wrangler dev server for the worker, run:
```bash
bun dev
```
This will start the frontend on `http://localhost:3000` (or another available port) and the backend worker, making the API accessible to the frontend.
### Building for Production
To build the application for production, run:
```bash
bun build
```
This command will build the React frontend and compile the Cloudflare Worker.
## 📁 Project Structure
*   `src/`: Contains the React frontend application code.
    *   `components/`: Reusable UI components.
    *   `pages/`: Top-level page components.
    *   `lib/`: Utility functions and client-side API services.
    *   `hooks/`: Custom React hooks.
*   `worker/`: Contains the Cloudflare Worker backend code.
    *   `index.ts`: The entry point for the worker.
    *   `userRoutes.ts`: Defines the API routes for the application.
    *   `agent.ts`: The core `ChatAgent` Durable Object class.
    *   `app-controller.ts`: The `AppController` Durable Object for session management.
## ☁️ Deployment
This project is designed for deployment on the Cloudflare network.
1.  **Login to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account:
    ```bash
    wrangler login
    ```
2.  **Configure Secrets:**
    For production, you must set your secrets in the Cloudflare dashboard or via the CLI. Never commit secrets to your repository.
    ```bash
    wrangler secret put CF_AI_API_KEY
    ```
3.  **Deploy the application:**
    Run the deploy script to build and deploy your application to Cloudflare.
    ```bash
    bun deploy
    ```
This command will build the frontend, deploy the static assets to Cloudflare Pages, and deploy the backend logic to Cloudflare Workers.
[cloudflarebutton]
## 🤝 Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details.