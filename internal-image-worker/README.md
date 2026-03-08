# QV Internal Image Worker

Private image generation endpoint for internal automation.

## Endpoints
- `GET /health`
- `POST /generate`

## Auth
- Bearer token via `Authorization: Bearer <INTERNAL_TOKEN>`

## Request body
```json
{
  "sourceId": "f9263d2cb1ceba1fe6d8089bd99c53bb",
  "prompt": "cinematic editorial...",
  "negativePrompt": "optional",
  "allowBranding": false,
  "model": "@cf/black-forest-labs/flux-1-schnell"
}
```

## Response
```json
{
  "ok": true,
  "sourceId": "...",
  "key": "covers/<sourceId>.png",
  "size": 12345,
  "model": "@cf/black-forest-labs/flux-1-schnell",
  "allowBranding": false
}
```
