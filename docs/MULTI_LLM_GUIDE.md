# KEAOS Multi-LLM Orchestration Guide
*Universal foundation model configuration, live execution, and multi-provider architecture.*

---

## 1. Supported Foundation Model Providers

KEAOS is completely model-agnostic. The platform does not rely on or require any single model provider. It supports 5 major providers out-of-the-box:

| Provider Key | Provider Name | Default Model | Base URL / Host | Key Required? |
| :--- | :--- | :--- | :--- | :--- |
| `google` | Google GenAI | `gemini-2.0-flash` | `https://generativelanguage.googleapis.com` | Yes (`VITE_GEMINI_API_KEY`) |
| `anthropic` | Anthropic Claude | `claude-3-5-sonnet-20241022` | `https://api.anthropic.com/v1/messages` | Yes (`VITE_ANTHROPIC_API_KEY`) |
| `openai` | OpenAI | `gpt-4o` | `https://api.openai.com/v1/chat/completions` | Yes (`VITE_OPENAI_API_KEY`) |
| `ollama` | Ollama (Local) | `llama3.3` | `http://localhost:11434/v1/chat/completions` | **NO (100% Free & Local)** |
| `openrouter`| OpenRouter | `anthropic/claude-3.5-sonnet` | `https://openrouter.ai/api/v1/chat/completions` | Yes (`VITE_OPENROUTER_API_KEY`) |

---

## 2. Configuration Methods

### Method A: In-App Multi-LLM Credential Registry Modal
1. Click **"Configure LLM APIs"** in the top navigation bar.
2. Select any of the 5 tabs (`Google GenAI`, `Anthropic`, `OpenAI`, `Ollama`, `OpenRouter`).
3. Enter your API key (or customize your local Ollama URL).
4. Click **"Test Live Connection"** to verify that credentials are valid and display live latency.
5. Click **"Save & Apply Credentials"** to store them encrypted in `localStorage`.

### Method B: Environment Variables (`.env.local`)
Create `.env.local` in the project root:
```env
# Google GenAI
VITE_GEMINI_API_KEY=AIzaSy...

# Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI GPT-4o & Whisper
VITE_OPENAI_API_KEY=sk-proj-...

# Ollama Local (No key required)
VITE_OLLAMA_BASE_URL=http://localhost:11434

# OpenRouter 200+ Models Gateway
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

---

## 3. Technical Integration Details

### Anthropic Direct Browser Access
Direct browser `fetch` to Anthropic requires the header:
```javascript
headers: {
  'x-api-key': credential,
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json',
  'anthropic-dangerous-direct-browser-access': 'true'
}
```
This bypasses browser CORS origin blocking safely within the client workspace.

### OpenAI Strict JSON Object Mode
To ensure guaranteed JSON output matching our synthesis schema, we pass:
```javascript
body: JSON.stringify({
  model: modelId,
  response_format: { type: "json_object" },
  messages: [...]
})
```

### Ollama Local Setup
1. Install Ollama from [ollama.com](https://ollama.com).
2. Pull and run your preferred model:
   ```bash
   ollama run llama3.3
   ```
3. KEAOS connects via `http://localhost:11434/v1/chat/completions`. No data leaves your machine.

---

## 4. How to Add a 6th Provider (e.g. Groq, Mistral, Together, Cohere)

To add another model provider, make 3 small additions in `src/services/llmService.js`:

1. **Register Provider Definition**:
   ```javascript
   export const PROVIDERS = {
     // ... existing providers
     groq: {
       id: 'groq',
       name: 'Groq Cloud',
       envKey: 'VITE_GROQ_API_KEY',
       storageKey: 'keaos_key_groq',
       defaultModel: 'llama-3.3-70b-versatile',
       models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
       docsUrl: 'https://console.groq.com/keys',
       placeholder: 'gsk_...'
     }
   };
   ```
2. **Add Connection Ping in `testProviderConnection`**:
   Add a `case 'groq':` or fetch statement testing a 1-token prompt.
3. **Add Inference Branch in `synthesizeMeetingUniversal`**:
   Add `else if (provider === 'groq')` dispatching the structured prompt to Groq's completions endpoint.

The new provider will automatically appear in the canvas Inspector, the Header badge, the Credential Registry modal, and the Evaluation view!
