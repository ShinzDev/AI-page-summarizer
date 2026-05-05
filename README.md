# AI Page Summarizer Chrome Extension

A Manifest V3 Chrome Extension that extracts the main content of any web article and uses AI to generate a structured, minimalist summary. 

This project was built to explore Chrome Extension architecture (Popup, Background Workers, Content Scripts) and secure AI API integration via a proxy server.

## 🏗️ Architecture

This extension follows a strictly modular architecture utilizing Chrome's Manifest V3 messaging pipeline:

1. **The Presentation Layer (Popup UI):** 
   Built with vanilla HTML/CSS/JS featuring a minimalist, high-contrast design inspired by modern AI interfaces. It acts as the trigger for the extension and the display engine for the final JSON data.
2. **The Extraction Layer (Content Script):** 
   Injected into the active tab. It securely clones the host page's DOM and uses Mozilla's `Readability.js` to strip away navigation menus, footers, and ads, extracting only the core article text.
3. **The Orchestration Layer (Background Service Worker):** 
   Acts as the central router. It receives the extracted text from the Content Script and securely forwards it to the external backend via `fetch()`, ensuring no heavy processing blocks the UI thread.
4. **The Network Layer (Proxy Server):** 
   A standalone Node.js/Express server that securely holds the AI API keys. It accepts requests from the extension, prompts the LLM to return structured JSON, and sends the payload back to the background worker.

## 🧠 AI Integration

This project integrates with the **gemma-3n-e4b-it** model. 

Instead of basic text generation, the AI is explicitly prompted using System Instructions and `response_format: { type: "json_object" }` to return a strictly typed JSON object containing:
* `readingTime`: Estimated time to read the original article.
* `bullets`: An array of 3-5 core factual takeaways.
* `insights`: A synthesized paragraph detailing the broader implications of the text.

## 🔒 Security Decisions

* **No Exposed Secrets:** AI API keys are strictly kept out of the Chrome Extension bundle. All LLM communication is routed through the Node.js proxy server.
* **Minimal Permissions:** The `manifest.json` requests only `activeTab` and `scripting` permissions. It does not request broad `<all_urls>` background access, ensuring it only runs when explicitly invoked by the user.
* **Safe DOM Manipulation:** The content script uses `DOMParser` to stringify and re-parse the active document before passing it to Readability.js. This prevents cross-origin or script execution errors that can occur when deeply cloning dynamic React/Next.js Single Page Applications.

## ⚖️ Trade-offs

* **Vanilla JS vs. Bundlers:** The extension is built without Webpack or Vite to focus purely on core browser APIs and extension mechanics. The trade-off is the manual vendoring of libraries (like `Readability.js`) and lack of hot-module reloading during development.
* **Local Proxy vs. Edge Functions:** For this iteration, a local Express server is used for the proxy. While perfectly secure, in a production environment, migrating this proxy to Vercel Edge Functions or Cloudflare Workers would reduce latency and eliminate server maintenance overhead.
* **Extracted Text Limits:** We currently pass the entire extracted string to the LLM. For massive articles, this could exceed context windows. Future iterations should implement token chunking prior to the API request.

---

## 🚀 Setup & Installation Instructions

### Part 1: Set up the Proxy Server
1. Navigate to the proxy server directory:
   ```bash
   cd proxy-server-summarizer
    npm install express cors dotenv @google/generative-ai
2. Install dependencies:
   ```bash
    npm install express cors dotenv @google/generative-ai
3. Create a `.env` file in the proxy directory and add your API key:
  ```env
    PORT=3001
    API_KEY=your_actual_api_key_here
4.  Start the server:
    ```Bash
    node server.js

### Part 2: Install the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top right corner.
3. Click the **Load unpacked** button in the top left.
4. Select the root folder of this extension (the folder containing `manifest.json`).

### Part 3: Usage
1. Ensure your local proxy server is running.
2. Navigate to any text-heavy article or news site (e.g., CNN, Medium, Wikipedia).
3. Click the **Page Summarizer** icon in your Chrome toolbar.
4. Click **Summarize** and wait for the AI to process the text.