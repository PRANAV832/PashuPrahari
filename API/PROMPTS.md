# AI Coding Context & Guardrails for Cursor / Antigravity

## Core Guidelines
1. **No Overengineering:** Keep code modular, clean, and minimal. Avoid heavy enterprise design patterns, microservices, or complex state management libraries (use React Context or simple useState).
2. **Error Boundaries:** Every API call on the frontend must include loading states and graceful fallback UI errors so the screen never breaks during the live demo.
3. **Environment Variables:** Always use `process.env` or `import.meta.env` for API keys (OpenAI, Twilio, DB URIs). Never hardcode credentials.

## Specific Module Instructions
- **Frontend (Member 1):** Use Tailwind CSS for rapid UI styling. Ensure the map container explicitly has a defined height (e.g., `h-[500px]`) so Leaflet renders correctly without collapsing.
- **Backend (Member 2):** Use Express with `cors` and `express.json()` middleware enabled globally. Keep routes organized inside a dedicated `/routes` folder.
- **AI Layer (Member 3):** When calling LLMs, enforce JSON response types and include system prompts that instruct the model to return *only* valid JSON without markdown code blocks (` ```json ` wrappers) to prevent JSON parsing crashes.