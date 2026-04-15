# AI Provider Configuration

Excalidraw Studio использует [CopilotKit `BuiltInAgent`](https://docs.copilotkit.ai/integrations/built-in-agent/model-selection) для подключения к языковым моделям. Провайдер выбирается через переменные окружения в `.env.local` — менять код не нужно.

## Механизм выбора модели

`src/app/api/copilotkit/route.ts` проверяет переменные в следующем приоритете:

```
1. OLLAMA_MODEL   →  локальная Ollama (OpenAI-compatible API)
2. AI_MODEL       →  облачный провайдер (встроенная строка CopilotKit)
3. default        →  "openai/gpt-4o"
```

---

## Ollama (локальные модели)

Ollama запускает LLM локально и предоставляет OpenAI-совместимый API на `http://localhost:11434`.

### Требования

- [Ollama](https://ollama.com) установлен и запущен
- Нужная модель скачана: `ollama pull <model>`

### Настройка `.env.local`

```env
OLLAMA_MODEL=qwen3.5:9b
OLLAMA_BASE_URL=http://localhost:11434/v1   # по умолчанию, можно не указывать
```

### Доступные модели (пример)

| Модель | Размер | Применение |
|--------|--------|-----------|
| `qwen3.5:9b` | 9.7B | Генерация диаграмм (рекомендуется) |
| `qwen3-vl:8b` | 8.8B | Мультимодальные задачи (текст + изображения) |

Просмотреть все установленные модели:
```bash
ollama list
```

Скачать новую модель:
```bash
ollama pull llama3.2
ollama pull mistral
ollama pull deepseek-r1:8b
```

### Как работает подключение

Ollama реализует OpenAI-совместимый API, поэтому используется `@ai-sdk/openai` с переопределённым `baseURL`:

```typescript
// src/app/api/copilotkit/route.ts (упрощённо)
import { createOpenAI } from "@ai-sdk/openai";

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: "ollama", // фиктивный ключ — Ollama не требует аутентификации
});

const agent = new BuiltInAgent({ model: ollama("qwen3.5:9b") });
```

---

## OpenAI

```env
# .env.local
AI_MODEL=openai/gpt-4o
OPENAI_API_KEY=sk-proj-...
```

Доступные модели: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `o1`, `o3-mini`

Получить ключ: https://platform.openai.com/settings/organization/api-keys

---

## Anthropic

```env
# .env.local
AI_MODEL=anthropic:claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-...
```

Доступные модели: `claude-opus-4-5`, `claude-sonnet-4-6`, `claude-3-5-haiku-latest`

Получить ключ: https://console.anthropic.com/settings/keys

---

## Google Gemini

```env
# .env.local
AI_MODEL=google:gemini-2.5-flash
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

Доступные модели: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.0-flash`

Получить ключ: https://aistudio.google.com/app/apikey

---

## Кастомный OpenAI-совместимый провайдер

Для любого провайдера с OpenAI-compatible API (Azure OpenAI, LM Studio, vLLM, LocalAI и т. д.) используется прямое редактирование `route.ts`:

```typescript
// src/app/api/copilotkit/route.ts
import { createOpenAI } from "@ai-sdk/openai";

const customProvider = createOpenAI({
  baseURL: "https://your-provider.example.com/v1",
  apiKey: process.env.CUSTOM_API_KEY,
});

const agent = new BuiltInAgent({
  model: customProvider("your-model-name"),
  prompt: excalidrawSkill,
});
```

---

## Таблица переменных окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `OLLAMA_MODEL` | — | Имя модели Ollama. При наличии — Ollama имеет наивысший приоритет |
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | URL Ollama API |
| `AI_MODEL` | — | Строка модели CopilotKit (`provider:model`). Используется если `OLLAMA_MODEL` не задан |
| `OPENAI_API_KEY` | — | Ключ OpenAI |
| `ANTHROPIC_API_KEY` | — | Ключ Anthropic |
| `GOOGLE_GENERATIVE_AI_API_KEY` | — | Ключ Google AI |
| `MCP_SERVER_URL` | `http://localhost:3001/mcp` | URL MCP сервера Excalidraw |
| `KV_REST_API_URL` | — | Upstash Redis URL (для Vercel) |
| `KV_REST_API_TOKEN` | — | Upstash Redis токен (для Vercel) |

---

## Быстрое переключение провайдеров

Чтобы сменить провайдер — достаточно отредактировать `.env.local` и перезапустить сервер (`npm run dev`). Пример файла для переключения:

```env
# Включить нужный блок, остальные закомментировать

# --- Ollama ---
OLLAMA_MODEL=qwen3.5:9b

# --- OpenAI ---
# AI_MODEL=openai/gpt-4o
# OPENAI_API_KEY=sk-proj-...

# --- Anthropic ---
# AI_MODEL=anthropic:claude-sonnet-4-6
# ANTHROPIC_API_KEY=sk-ant-...
```
