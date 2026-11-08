# merckel.dev

Personal website of Pierre-Maurice Merckel: portfolio, pentest writeups and a collection of free
browser-based developer tools. Built with SvelteKit 2, Svelte 5, Tailwind CSS v4 and PostgreSQL.
The site is available in English and German.

## Getting started

Requirements: [Bun](https://bun.sh) and Docker (for the local database).

```sh
bun install
cp .env.example .env    # adjust DATABASE_URL, SMTP and GitHub settings as needed
bun run dev:db          # start PostgreSQL via docker compose
bun run db:migrate      # apply the migrations in ./drizzle
bun run dev
```

The app also runs without a database: short links are then unavailable and tool usage counts
stay at zero.

## Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `bun run dev`         | Start the dev server                  |
| `bun run build`       | Production build (`build/`)           |
| `bun run preview`     | Preview the production build          |
| `bun run check`       | Type-check with `svelte-check`        |
| `bun run lint`        | Prettier + ESLint                     |
| `bun run format`      | Format all files                      |
| `bun run test`        | Run the Vitest suite once             |
| `bun run test:unit`   | Vitest in watch mode                  |
| `bun run db:generate` | Generate a migration from `schema.ts` |
| `bun run db:migrate`  | Apply migrations                      |

## Configuration

All environment variables are documented in [`.env.example`](.env.example). The important ones
for production:

- `ORIGIN` — public URL of the site (required for SvelteKit's CSRF protection).
- `DATABASE_URL` — PostgreSQL connection string.
- `XFF_DEPTH` — number of trusted reverse proxies in front of the app. Rate limiting reads the
  client address from `X-Forwarded-For`, counting this many entries from the right.
- `SMTP_*`, `CONTACT_TO` — mail delivery for the contact form.
- `GITHUB_TOKEN` — optional, raises the GitHub API rate limit for the open-source section.

## Deployment

The site runs as a Docker container (`Dockerfile`, `docker-compose.yml`) behind a reverse proxy.
Migrations are applied automatically when the container starts. Deployments are triggered
manually via the "Docker Deployment" GitHub Actions workflow on the self-hosted runner.

## Content

- Projects, experience, testimonials and tools: `src/lib/data/`
- Pentest writeups: Markdown files with frontmatter in `src/content/pentesting/`
  (`published: true` makes them visible; `lang` defaults to `de`)
- UI translations: `src/lib/i18n/messages.ts`

See [`AGENTS.md`](AGENTS.md) for architecture and coding conventions.
