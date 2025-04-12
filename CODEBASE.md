# Photograph Codebase Documentation

## Overview

Photograph is a clean, minimalist photo gallery application built with Next.js. It enables users to create, organize, and share photography collections with a distraction-free interface that emphasizes visual content. The application prioritizes a seamless user experience for photographers to showcase their work.

## Core Features

- **Gallery Creation & Management**: Users can create and organize photo collections with custom names and descriptions
- **Collaborative Galleries**: Invite others to contribute to galleries with different permission levels (viewer, editor, admin)
- **Privacy Controls**: Customize gallery visibility and sharing settings
- **Exhibitions**: Create curated displays of images with custom layouts
- **Responsive Design**: Optimized viewing experience across desktop, tablet, and mobile devices
- **Image Management**: Upload, arrange, and showcase photography with efficient image handling

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Query and SWR for data fetching
- **Drag & Drop**: React DND for image arrangement
- **Image Display**: React Masonry CSS for gallery layouts
- **Carousel**: Embla Carousel for image browsing
- **Animations**: Motion library for smooth transitions

### Backend
- **API Routes**: Next.js API routes for backend functionality
- **Authentication**: Clerk for secure user authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Image Upload**: UploadThing for efficient file uploads
- **Server Actions**: Next.js Server Actions for authenticated data operations

## Data Structure

The database schema includes several key entities:

1. **Galleries**
   - Core entity for organizing collections of images
   - Properties include name, description, user ownership, and visual styling

2. **Images**
   - Individual photographs within galleries
   - Linked to galleries with metadata and storage URLs

3. **Gallery Collaborators**
   - Manages shared access to galleries
   - Includes permission roles (viewer, editor, admin)
   - Tracks invitation status and associated metadata

4. **Exhibitions** (implied from queries)
   - Curated displays of images from galleries
   - Can be published or kept private
   - Includes arranged image positions

## Application Flow

1. **Authentication**: Users sign in via Clerk authentication
2. **Gallery Management**: 
   - Create, update, or delete galleries
   - Upload images to galleries
   - Update cover photos and styling
3. **Collaboration**:
   - Invite users to collaborate on galleries
   - Manage collaborator permissions
   - Share galleries with specific privacy settings
4. **Exhibition Creation**:
   - Select and arrange images for display
   - Customize exhibition layout
   - Publish exhibitions for public viewing

## Development Tools

- **TypeScript**: For type-safe code
- **ESLint & Prettier**: Code quality and formatting
- **Drizzle Kit**: Database migration and schema management
- **pnpm**: Package management
- **Next.js Development Server**: Local development with Turbo mode

## Deployment

The application is designed for deployment on platforms like Vercel with PostgreSQL database hosting, leveraging modern cloud infrastructure for optimal performance and reliability.

## Architecture Considerations

- **Security**: Authentication and authorization at multiple levels
- **Performance**: Optimized image loading and caching
- **Scalability**: Database design supports growing user base and content
- **User Experience**: Clean, responsive interface with intuitive navigation