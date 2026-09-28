import { ENV } from "./_core/env";

const GEMINI_MODEL = "gemini-flash-lite-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
type GeminiPayload = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

async function requestGemini(prompt: string, jsonMode = false): Promise<GeminiPayload> {
  if (!ENV.geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");
  let lastStatus = 500;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(ENV.geminiApiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.65, ...(jsonMode ? { responseMimeType: "application/json" } : {}) },
      }),
    });
    if (response.ok) return await response.json() as GeminiPayload;
    lastStatus = response.status;
    const body = await response.text();
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) {
      console.error("[Gemini] Request failed", response.status, body.slice(0, 500));
      throw new Error(`Gemini request failed with status ${response.status}`);
    }
    await new Promise(resolve => setTimeout(resolve, 450 * (attempt + 1)));
  }
  throw new Error(`Gemini request failed with status ${lastStatus}`);
}

function responseText(payload: GeminiPayload) {
  return payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("").trim() ?? "";
}

export async function generateGeminiJson<T>(prompt: string): Promise<T> {
  const text = responseText(await requestGemini(prompt, true));
  if (!text) throw new Error("Gemini returned an empty response");
  try {
    return JSON.parse(text) as T;
  } catch {
    return JSON.parse(text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim()) as T;
  }
}

export async function generateGeminiText(prompt: string): Promise<string> {
  const text = responseText(await requestGemini(prompt));
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}
