# Photograph

A clean, minimalist photo gallery application built with Next.js. Photograph makes it easy to create, organize, and share photography collections with a distraction-free interface that puts your images first.

## Demo

https://github.com/yourusername/photograph/assets/video-showcase.mp4

_A video demonstration of Photograph in action, showing gallery creation, image uploads, and the collaboration features._

## Features

- 🖼️ Create and manage beautiful photo galleries
- 👥 Collaborate with others on shared galleries
- 🔗 Share galleries with customizable privacy settings
- 📱 Fully responsive design across all devices
- 🔒 Secure authentication with Clerk
- 🗄️ PostgreSQL database with Drizzle ORM
- ⚡ Optimized image loading and caching
- 📤 Simple and efficient image uploads with UploadThing

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Clerk
- **File Upload:** UploadThing
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photograph.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the database:
```bash
./start-database.sh
```

4. Set up environment variables:
```bash
# Create a .env file and add your variables
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

5. Run the development server:
```bash
pnpm dev
```

## Project Structure

```
photograph/
├── src/
│   ├── app/          # Next.js App Router pages and API routes
│   │   ├── components/  # Application-specific components
│   │   ├── gallery/     # Gallery-related pages
│   │   ├── api/         # API routes for galleries, images, and invitations
│   │   └── create/      # Gallery creation page
│   ├── components/   # Reusable UI components
│   │   └── ui/         # Base UI components
│   ├── server/       # Server-side code
│   │   ├── db/         # Database schema and connection
│   │   ├── actions.ts  # Server actions
│   │   └── queries.ts  # Database queries
│   └── styles/       # Global styles
├── public/          # Static assets and images
└── drizzle/         # Database migrations
```

## Key Features

- **Gallery Management**: Create and organize photo collections with custom names and descriptions
- **Collaboration**: Invite others to contribute to your galleries
- **Image Management**: Upload, arrange, and showcase your photography
- **Sharing Options**: Control who can view and interact with your galleries
- **Responsive Design**: Optimized viewing experience on desktop, tablet, and mobile devices

## Development

- Run database migrations:
```bash
pnpm db:push
```

- Generate database types:
```bash
pnpm db:generate
```

- Open database studio:
```bash
pnpm db:studio
```

## License

[MIT](LICENSE)
