# Bible Aura 🙏

A beautiful, modern Bible application with journaling, study tools, and spiritual growth features.

## Features

- **Bible Reading**: Read the Bible in English (KJV) and Tamil
- **Personal Journal**: Document your spiritual journey with categories, moods, and verse references
- **AI-Powered Chat**: Get biblical insights and answers to your spiritual questions
- **Daily Verses**: Receive inspiring verses each day
- **Study Tools**: Highlights, notes, and reading plans
- **Sermon Library**: Organize and access sermon content

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Bible-Aura
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env.local`
3. Run the database setup:
   ```bash
   node setup-database.js
   ```

### Troubleshooting Journal Issues

If journaling isn't working:

1. **Check Authentication**: Make sure you're signed in
2. **Verify Database Setup**: Check if the `journal_entries` table exists in your Supabase dashboard
3. **Environment Variables**: Ensure `.env.local` has correct Supabase credentials
4. **Console Errors**: Open browser dev tools to check for error messages

**Common Solutions:**
- Clear browser cache and reload the page
- Sign out and sign back in
- Check Supabase dashboard for table permissions
- Ensure Row Level Security policies are properly configured

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Build Tool**: Vite
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the Christian community
