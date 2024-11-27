# Photograph

A modern, lightweight photo gallery application built with Next.js 13+ App Router. Photograph allows users to create and manage beautiful image galleries with a focus on performance and simplicity.

## Features

- 🖼️ Create and manage multiple photo galleries
- 🏃‍♂️ Fast image loading with Next.js Image optimization
- 🎨 Clean, minimal UI with a focus on the photos
- 📱 Fully responsive design
- 🔒 Secure authentication with Clerk
- 🗄️ PostgreSQL database with Drizzle ORM
- ⚡ Server Components for optimal performance
- 📤 Efficient image uploads with UploadThing

## Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Clerk
- **File Upload:** UploadThing
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photograph.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file and add your variables
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
UPLOADTHING_TOKEN=
```

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
photograph/
├── app/
│   ├── components/     # Reusable UI components
│   ├── galleries/     # Gallery-related pages
│   └── layout.tsx     # Root layout
├── lib/
│   ├── db/           # Database configuration and schema
│   └── utils/        # Utility functions
└── public/           # Static assets
```

## Key Features Implementation

- **Gallery Management**: Users can create, view, and manage their photo galleries
- **Image Upload**: Efficient image upload handling with progress tracking
- **Responsive Design**: Optimized viewing experience across all devices
- **Performance**: Leverages Next.js 13+ features for optimal loading and rendering

## Performance Optimizations

- Server Components for reduced client-side JavaScript
- Optimized image loading with Next.js Image component
- Efficient database queries with Drizzle ORM
- Progressive image loading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
