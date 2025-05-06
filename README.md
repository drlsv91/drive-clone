# DriveClone - Google Drive Clone

A fullstack Google Drive clone built with Next.js, React, and Prisma.

## Features

- 🔒 User authentication via Google OAuth
- 📁 Create folders and upload files
- 📱 Responsive design for mobile and desktop
- 🖼️ File previews for images and PDFs
- 🌳 Folder hierarchy with breadcrumb navigation
- ⚡ Fast and modern UI with ShadCN components

## Tech Stack

- **Frontend**: React.js + Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudinary for file storage
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS with ShadCN UI components

## Demo

Live demo: [drive-clone.vercel.app](https://drive-clone-7cyl.vercel.app)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account
- Google OAuth credentials

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/drlsv91/drive-clone.git
   cd drive-clone
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the variables in the `.env.example`:

4. Initialize the database:

   ```bash
   pnpm prisma migrate dev --name init
   ```

5. Run the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for easy deployment on Vercel. Connect your GitHub repository to Vercel and set the environment variables in the Vercel dashboard.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
