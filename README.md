# Quotient

A modern web platform for collecting and organizing your favorite quotes, reflections, and creative writing pieces.

## Features

- 📝 Quote Collections
- 📚 Version History
- ✨ Markdown Editor
- 💡 Inspiration Board
- 📤 Export Options
- 🔒 Privacy Controls
- 📊 Writing Goals
- 👥 Collaboration Tools

## Tech Stack

- Frontend: Next.js 13 with TypeScript
- Styling: Tailwind CSS
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth.js with Google Sign-in

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- PostgreSQL database
- Google OAuth credentials

### Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd quotient
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your credentials:
- Set up Google OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
- Generate NEXTAUTH_SECRET using: `openssl rand -base64 32`
- Configure your PostgreSQL database URL

4. Initialize the database:
```bash
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/src/app/*` - App router pages and layouts
- `/src/components/*` - React components
- `/prisma/*` - Database schema and migrations
- `/public/*` - Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
