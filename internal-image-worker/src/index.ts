export interface Env {
  INTERNAL_TOKEN: string;
  NEWS_COVERS_KV: KVNamespace;
  AI: Ai;
}

type GenerateRequest = {
  sourceId?: string;
  prompt?: string;
  negativePrompt?: string;
  allowBranding?: boolean;
  model?: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "authorization,content-type",
    },
  });
}

function unauthorized(): Response {
  return json({ ok: false, error: "unauthorized" }, 401);
}

function sanitizeSourceId(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

function normalizeImageBytes(result: unknown): Uint8Array | null {
  const decodeBase64 = (value: string): Uint8Array | null => {
    const clean = value.startsWith("data:") ? value.split(",", 2)[1] || "" : value;
    if (!clean) return null;
    try {
      const raw = atob(clean);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
      return bytes;
    } catch {
      return null;
    }
  };

  if (result instanceof ArrayBuffer) return new Uint8Array(result);
  if (result instanceof Uint8Array) return result;
  if (Array.isArray(result) && result.length > 0) {
    for (const item of result) {
      const bytes = normalizeImageBytes(item);
      if (bytes && bytes.byteLength > 0) return bytes;
    }
    return null;
  }
  if (typeof result === "string") return decodeBase64(result);
  if (typeof result !== "object" || !result) return null;

  const obj = result as Record<string, unknown>;
  const candidates: unknown[] = [
    obj.image,
    obj.output_image,
    obj.result,
    obj.data,
    obj.images,
    obj.output,
  ];

  for (const candidate of candidates) {
    const bytes = normalizeImageBytes(candidate);
    if (bytes && bytes.byteLength > 0) return bytes;
  }

  return null;
}

function summarizeResultShape(result: unknown): Record<string, unknown> {
  if (result === null || result === undefined) return { type: String(result) };
  if (result instanceof ArrayBuffer) return { type: "ArrayBuffer", byteLength: result.byteLength };
  if (result instanceof Uint8Array) return { type: "Uint8Array", byteLength: result.byteLength };
  if (typeof result === "string") return { type: "string", length: result.length, startsWith: result.slice(0, 24) };
  if (Array.isArray(result)) return { type: "array", length: result.length };
  if (typeof result === "object") {
    const obj = result as Record<string, unknown>;
    return {
      type: "object",
      keys: Object.keys(obj).slice(0, 20),
      hasImage: typeof obj.image === "string",
      hasOutputImage: typeof obj.output_image === "string",
      hasImagesArray: Array.isArray(obj.images),
      hasResult: typeof obj.result !== "undefined",
      hasData: typeof obj.data !== "undefined",
      hasOutput: typeof obj.output !== "undefined",
    };
  }
  return { type: typeof result };
}

async function handleGenerate(req: Request, env: Env): Promise<Response> {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return unauthorized();
  const token = auth.slice("Bearer ".length).trim();
  if (!token || token !== env.INTERNAL_TOKEN) return unauthorized();

  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const sourceId = sanitizeSourceId(String(body.sourceId || ""));
  const prompt = String(body.prompt || "").trim();
  const negativePrompt = String(body.negativePrompt || "").trim();
  const allowBranding = Boolean(body.allowBranding);
  const model = String(body.model || "@cf/black-forest-labs/flux-1-schnell").trim();

  if (!sourceId) return json({ ok: false, error: "sourceId_required" }, 400);
  if (!prompt) return json({ ok: false, error: "prompt_required" }, 400);

  const defaultNegatives = allowBranding
    ? "low quality, blurry, collage, split-screen, multi-panel, mosaic, storyboard"
    : "text overlay, logo, watermark, brand mark, letters, typography, signature, low quality, collage, split-screen, multi-panel, mosaic, storyboard";

  const fallbackModel = "@cf/black-forest-labs/flux-1-schnell";
  let aiResult: unknown;
  let finalModel = model;
  let usedFallback = false;
  try {
    aiResult = await env.AI.run(model, {
      prompt,
      negative_prompt: negativePrompt || defaultNegatives,
      width: 1344,
      height: 768,
      num_steps: 6,
      guidance: 3.5,
    });
  } catch (error) {
    return json({ ok: false, error: "ai_generation_failed", detail: String(error) }, 502);
  }

  let bytes = normalizeImageBytes(aiResult);
  if ((!bytes || bytes.byteLength === 0) && model !== fallbackModel) {
    usedFallback = true;
    finalModel = fallbackModel;
    try {
      aiResult = await env.AI.run(fallbackModel, {
        prompt,
        negative_prompt: negativePrompt || defaultNegatives,
        width: 1344,
        height: 768,
        num_steps: 6,
        guidance: 3.5,
      });
      bytes = normalizeImageBytes(aiResult);
    } catch {
      // Return original shape from the primary model if fallback fails.
    }
  }

  if (!bytes || bytes.byteLength === 0) {
    return json({ ok: false, error: "ai_empty_image", shape: summarizeResultShape(aiResult), model: finalModel }, 502);
  }

  const key = `covers/${sourceId}.png`;
  await env.NEWS_COVERS_KV.put(key, bytes, {
    metadata: { contentType: "image/png", sourceId, createdAt: new Date().toISOString() },
  });

  return json({
    ok: true,
    sourceId,
    key,
    size: bytes.byteLength,
    model: finalModel,
    usedFallback,
    allowBranding,
    imageUrl: `/image/${sourceId}`,
  });
}

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "authorization,content-type",
          "access-control-max-age": "86400",
        },
      });
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "qv-internal-image-worker" });
    }

    if (req.method === "POST" && url.pathname === "/generate") {
      return handleGenerate(req, env as Env);
    }

    if (req.method === "GET" && url.pathname.startsWith("/image/")) {
      const sourceId = sanitizeSourceId(url.pathname.replace(/^\/image\//, ""));
      if (!sourceId) return json({ ok: false, error: "sourceId_required" }, 400);
      const key = `covers/${sourceId}.png`;
      const value = await (env as Env).NEWS_COVERS_KV.get(key, { type: "arrayBuffer" });
      if (!value) return json({ ok: false, error: "not_found" }, 404);
      return new Response(value, {
        headers: {
          "content-type": "image/png",
          "cache-control": "private, max-age=0, no-store",
          "access-control-allow-origin": "*",
        },
      });
    }

    // Fallback image lookup:
    // 1) exact sourceId
    // 2) first key that starts with sourceId- (e.g. sourceId-modelVariant)
    if (req.method === "GET" && url.pathname.startsWith("/image-any/")) {
      const sourceId = sanitizeSourceId(url.pathname.replace(/^\/image-any\//, ""));
      if (!sourceId) return json({ ok: false, error: "sourceId_required" }, 400);

      const exactKey = `covers/${sourceId}.png`;
      let value = await (env as Env).NEWS_COVERS_KV.get(exactKey, { type: "arrayBuffer" });
      let resolvedSourceId = sourceId;

      if (!value) {
        const prefix = `covers/${sourceId}-`;
        const listed = await (env as Env).NEWS_COVERS_KV.list({ prefix, limit: 1 });
        const first = listed.keys?.[0]?.name;
        if (first) {
          value = await (env as Env).NEWS_COVERS_KV.get(first, { type: "arrayBuffer" });
          resolvedSourceId = first.replace(/^covers\//, "").replace(/\.png$/i, "");
        }
      }

      if (!value) return json({ ok: false, error: "not_found" }, 404);
      return new Response(value, {
        headers: {
          "content-type": "image/png",
          "cache-control": "private, max-age=0, no-store",
          "x-resolved-source-id": resolvedSourceId,
          "access-control-allow-origin": "*",
        },
      });
    }

    return json({ ok: false, error: "not_found" }, 404);
  },
} satisfies ExportedHandler<Env>;
