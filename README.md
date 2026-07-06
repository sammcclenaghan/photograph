# Photograph

A photo gallery app for organizing and sharing photography collections — create galleries, upload photos into a masonry grid, and invite collaborators by email.

## Stack

- Next.js 16 (App Router) + React 19
- PostgreSQL with Drizzle ORM
- Clerk (authentication), UploadThing (image storage)
- Tailwind CSS 4, Radix UI, Motion

## Development

```bash
pnpm install
cp .env.example .env   # fill in Postgres, Clerk, and UploadThing keys
pnpm db:push
pnpm dev
```

`pnpm check` (ESLint + tsc) must pass before deploying.

Useful database commands: `pnpm db:generate` for migrations, `pnpm db:studio` to browse data.

## How it works

Galleries and images live in Postgres; the schema (`src/server/db/schema.ts`) is the single source of truth for row types. Uploads go through UploadThing's file router (`src/app/api/uploadthing/core.ts`), which checks gallery access before accepting files. Collaboration works through email invitations — pending invites surface in the header and can be accepted or declined in place. Auth runs in Clerk middleware (`src/proxy.ts`), so every route is protected by default.

## License

[MIT](LICENSE)
