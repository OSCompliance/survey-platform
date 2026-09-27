# Survey Platform

Real-time survey platform for Tamil Nadu welfare scheme research.

## Tech Stack
- **Backend:** Cloudflare Workers (Hono) + D1 SQLite
- **Frontend:** React + Vite + Tailwind CSS
- **Hosting:** Cloudflare Pages + Workers
- **CI/CD:** GitHub Actions

## Deployment

The app is deployed automatically on push to main via GitHub Actions.

Requires GitHub secrets:
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
