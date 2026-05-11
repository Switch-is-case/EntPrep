const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_API_KEY;

if (!DIFY_API_KEY) {
  console.warn("DIFY_API_KEY not set - AI features disabled");
}

export interface DifyResponse {
  answer: string;
  conversation_id?: string;
  message_id?: string;
  metadata?: {
    usage?: {
      total_tokens: number;
      total_price: string;
    };
  };
}

export async function callDify(
  query: string, 
  inputs: Record<string, any> = {},
  userId: string
): Promise<DifyResponse> {
  if (!DIFY_API_KEY) {
    throw new Error("Dify API key not configured");
  }

  const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${DIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs,
      query,
      response_mode: "blocking",
      conversation_id: "",
      user: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Dify API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Robust helper to extract JSON from Dify answer.
 * Handles mixed text/JSON, markdown blocks, and common syntax issues.
 */
export function extractJSON(text: string): any {
  if (!text || typeof text !== "string") {
    console.error("DIFY ERROR: Received empty or non-string response");
    throw new Error("Empty or invalid AI response");
  }


  const trimmed = text.trim();

  // Стратегия 1: Поиск в markdown блоке ```json ... ``` или ``` ... ```
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch (e) {
      console.warn("DIFY PARSE: Strategy 1 (Markdown Block) failed, trying next...");
    }
  }

  // Стратегия 2: Чистый JSON (от { до })
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      console.warn("DIFY PARSE: Strategy 2 (Strict Trimmed) failed, trying next...");
    }
  }

  // Стратегия 3: Найти первый { и последний } (Извлечение из текста)
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const extracted = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(extracted);
    } catch (e) {
      console.warn("DIFY PARSE: Strategy 3 (Brace Extraction) failed, trying next...");
    }
  }

  // Стратегия 4: Sanitize - исправление «кривых» кавычек и лишних запятых
  const sanitized = text
    .replace(/[«»“”„“]/g, '"')      // Исправляем разные виды кавычек
    .replace(/[‘’]/g, "'")
    .replace(/,\s*}/g, "}")     // Удаляем лишние запятые перед закрывающей скобкой
    .replace(/,\s*]/g, "]");
  
  const sanitizedFirstBrace = sanitized.indexOf("{");
  const sanitizedLastBrace = sanitized.lastIndexOf("}");
  
  if (sanitizedFirstBrace !== -1 && sanitizedLastBrace !== -1) {
    try {
      return JSON.parse(sanitized.substring(sanitizedFirstBrace, sanitizedLastBrace + 1));
    } catch (e) {
      console.warn("DIFY PARSE: Strategy 4 (Sanitization) failed.");
    }
  }

  // Если ничего не помогло — кричим о помощи
  console.error("=== DIFY FATAL: ALL PARSE STRATEGIES FAILED ===");
  console.error("AI response parse failed. Response length:", text?.length ?? 0);
  console.error("=== END FATAL ===");
  
  return {
    error: true,
    message: "AI response could not be parsed. Please try again.",
    weeks: [],
    summary: "Roadmap generation encountered an issue."
  };
}
