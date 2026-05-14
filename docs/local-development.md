# Local Development

## Prerequisites

- Node.js 20 or newer.
- npm.
- Local database and external providers are not required for current validation scripts.

## Setup

```sh
cp .env.example .env.local
npm run check
```

Use local or sandbox credentials only. Do not commit `.env.local`, production credentials, real patient data, recordings, or transcripts.

## Environment Conventions

- Required configuration belongs in `.env.example`.
- Secrets must have placeholder values in committed files.
- Test and local scripts should not require real voice-provider or AI-provider credentials.
- Runtime code should validate required variables before starting provider-backed services.

## Standard Scripts

- `npm run check`: validates fixture references and domain invariants.
- `npm run test`: currently aliases `check`.
- `npm run build`: currently aliases `check`.

## Webhook Development

When provider-backed webhooks are implemented, expose the local app with a tunnel and set:

- `APP_URL`
- `VOICE_PROVIDER_WEBHOOK_SECRET`
- Provider callback URLs for lifecycle and media/realtime events.

Webhook handlers should reject invalid signatures and process duplicate events idempotently.

## Branch Convention

Use the Linear issue key in branch names, for example:

```sh
git switch -c codex/ope-50-voice-agent-scope
```
