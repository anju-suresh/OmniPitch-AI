import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both cwd and backend directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const primaryKey = process.env.GEMINI_API_KEY || "";
const fallbackKeys = (process.env.GEMINI_FALLBACK_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

const allKeys = [primaryKey, ...fallbackKeys].filter(
  (k, idx, arr) => k && k !== "your_gemini_api_key_here" && arr.indexOf(k) === idx
);

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

// Pool of GoogleGenerativeAI instances with automatic multi-key failover
const keyPool = allKeys.map((key) => ({
  key,
  client: new GoogleGenerativeAI(key),
  exhaustedUntil: 0,
}));

if (keyPool.length > 0) {
  console.log(`[Gemini AI] Initialized ${keyPool.length} active API key(s) in failover pool. Default model: ${DEFAULT_MODEL}`);
} else {
  console.warn(
    "[Gemini AI Notice] No GEMINI_API_KEY detected in .env. Running in intelligent simulation mode. Set GEMINI_API_KEY to activate live API.",
  );
}

// In-Memory Response Cache to eliminate duplicate calls & preserve quota
const responseCache = new Map();

// Rolling 60-second rate limiter (strictly stays below Google's 15 RPM free tier limit)
const requestTimestamps = [];
const MAX_REQUESTS_PER_MINUTE = 10; // 10 RPM (safe buffer below 15 RPM)

/**
 * Helper to call Gemini models with caching, rate-limit preservation, multi-key failover, and automatic fallback
 */
export const callGemini = async ({
  modelName = DEFAULT_MODEL,
  prompt,
  systemInstruction = "",
  temperature = 0.7,
  fallbackGenerator = null,
}) => {
  // 1. Check in-memory cache first (cost: 0 API calls)
  const cacheKey = `${modelName}:${prompt.trim()}`;
  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    console.log(`\n=================== ⚡ GEMINI AI RESPONSE (CACHED) [${modelName}] ===================`);
    console.log(cached.trim());
    console.log(`=================================================================================\n`);
    return {
      success: true,
      text: cached,
      source: "live-gemini-cache",
      model: modelName,
      isCached: true
    };
  }

  // 2. If API keys are available, check rate limiter & key pool
  if (keyPool.length > 0) {
    const now = Date.now();
    // Prune timestamps older than 60 seconds
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
      requestTimestamps.shift();
    }

    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      console.warn(
        `[Gemini Rate Limiter] Safe buffer reached (${requestTimestamps.length}/15 RPM). Serving intelligent domain response to avoid Quota Exceeded 429.`
      );
    } else {
      // Build model candidate sequence to guarantee resilience against Google 404 model deprecations
      const modelsToTry = [modelName, "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.8-flash"]
        .filter((m, idx, arr) => m && arr.indexOf(m) === idx);

      for (const entry of keyPool) {
        if (entry.exhaustedUntil > now) continue;

        let quotaExhausted = false;
        for (const candidateModel of modelsToTry) {
          try {
            // Record timestamp for rate limit tracking
            requestTimestamps.push(now);

            const model = entry.client.getGenerativeModel({
              model: candidateModel,
              systemInstruction: systemInstruction || undefined,
              generationConfig: {
                temperature,
              },
            });

            console.log(`[Gemini AI] 🚀 Sending live request to ${candidateModel}... (Current RPM: ${requestTimestamps.length}/15)`);
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Cache successful response (persist for current session)
            responseCache.set(cacheKey, text);

            console.log(`\n=================== 🤖 GEMINI AI LIVE RESPONSE [${candidateModel}] ===================`);
            console.log(text.trim());
            console.log(`=================================================================================\n`);
            return {
              success: true,
              text,
              source: "live-gemini",
              model: candidateModel,
              isCached: false
            };
          } catch (err) {
            if (err.message?.includes("404") || err.message?.includes("not found")) {
              console.warn(`[Gemini AI] Model ${candidateModel} returned 404 Not Found. Automatically trying next active model...`);
              continue;
            } else if (
              err.message?.includes("429") ||
              err.message?.includes("Quota exceeded") ||
              err.message?.includes("Too Many Requests")
            ) {
              console.warn(`[Gemini AI] Key ${entry.key.slice(0, 10)}... reached quota limit. Rotating to next pool key...`);
              entry.exhaustedUntil = now + 60 * 60 * 1000; // block for 1 hour
              quotaExhausted = true;
              break;
            } else {
              console.error(`[Gemini API Error] ${err.message}.`);
              break;
            }
          }
        }
        if (!quotaExhausted) {
          // If it wasn't quota-exhausted and didn't succeed, break to fallback
          break;
        }
      }
    }
  }

  // Fallback to domain-intelligent simulation response
  if (typeof fallbackGenerator === "function") {
    const simulatedText = fallbackGenerator();
    console.log(`\n=================== ⚙️ DOMAIN INTELLIGENCE RESPONSE [Simulation] ===================`);
    console.log(simulatedText.trim().slice(0, 300) + (simulatedText.length > 300 ? "..." : ""));
    console.log(`=================================================================================\n`);
    return {
      success: true,
      text: simulatedText,
      source: "simulation-engine",
      model: `${modelName}-simulated`,
    };
  }

  return {
    success: true,
    text: "Analysis generated via OmniPitch local AI engine.",
    source: "simulation-engine",
    model: "local-engine",
  };
};

export const hasLiveGemini = () => keyPool.length > 0;
