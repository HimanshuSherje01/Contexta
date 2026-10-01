const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";
const REQUEST_TIMEOUT_MS = 90000; // 90 seconds

/**
 * Generate answer using local Ollama model
 * @param {string} prompt - Assembled RAG prompt
 * @returns {Promise<string>} - Generated text answer
 */
export async function generateAnswer(prompt) {
  const url = `${OLLAMA_BASE_URL.replace(/\/+$/, "")}/api/generate`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new Error(
        `LLM request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Ensure Ollama has sufficient CPU/GPU resources.`
      );
    }
    if (err.cause?.code === "ECONNREFUSED" || err.message?.includes("fetch failed")) {
      throw new Error(
        `Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Ensure Ollama is running and accessible.`
      );
    }
    throw new Error(`Failed to call Ollama: ${err.message}`);
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Ollama API returned HTTP ${response.status}: ${errorText || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.response) {
    throw new Error("Ollama returned an empty response");
  }

  return data.response.trim();
}

/**
 * Check if Ollama is reachable and the model exists
 */
export async function checkOllamaHealth() {
  try {
    const url = `${OLLAMA_BASE_URL.replace(/\/+$/, "")}/api/tags`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const hasModel = models.some((m) => m === OLLAMA_MODEL || m.startsWith(`${OLLAMA_MODEL}:`));
    return {
      ok: true,
      hasModel,
      availableModels: models,
      configuredModel: OLLAMA_MODEL,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
