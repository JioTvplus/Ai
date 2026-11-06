# NS AI — Kannada + English AI Chat Website

A beginner-friendly Node.js + Express website that calls the OpenAI Responses API from the server. The API key is never placed in browser JavaScript.

## Requirements

- A computer (Windows, macOS, or Linux)
- Node.js 20 or newer
- An OpenAI API key with API billing/credits enabled

## Run locally

1. Install Node.js from https://nodejs.org/
2. Open this folder in VS Code or a terminal.
3. Copy `.env.example` to a new file named `.env`.
4. Open `.env` and replace `replace_with_your_api_key` with your API key.
   - Create a key at https://platform.openai.com/api-keys
   - Do not share the key or commit `.env` to Git.
5. In this folder, run:

   ```bash
   npm install
   npm start
   ```

6. Open http://localhost:3000

## Choose a model

The default is `gpt-6-luna` in `.env.example`. Change `OPENAI_MODEL` to another model ID available to your API project if desired. Check current models and pricing at https://developers.openai.com/api/docs/models.

## Security notes before public deployment

This starter includes Helmet security headers, JSON size limits, basic request rate limiting, input validation, and server-side secret handling. Before a public launch, add user authentication, per-user quotas, persistent server-side conversation storage, abuse monitoring, and a privacy policy. Browser localStorage is only local to that browser and is not secure account-based history.

## Deploy

Deploy this Node.js app to a Node-compatible host such as Render or Railway:

- Build/install command: `npm install`
- Start command: `npm start`
- Add `OPENAI_API_KEY` and (optionally) `OPENAI_MODEL` as private environment variables in the host dashboard.
- Do not upload your `.env` file to the hosting provider or Git repository.

The server listens on `process.env.PORT`, as required by common Node hosting platforms.
