# Xaab - Next.js + Supabase Project

A modern web application built with Next.js 14 and Supabase for backend services.

## 🚀 Features

- ⚡ Next.js 14 with App Router
- 🎨 Tailwind CSS for styling
- 🔧 TypeScript for type safety
- 🗄️ Supabase for database and authentication
- 📱 Responsive design
- 🎯 ESLint for code quality

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update the `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Home page
│   └── layout.tsx      # Root layout
├── lib/                # Utility libraries
│   └── supabase.ts     # Supabase client configuration
└── types/              # TypeScript type definitions
    └── database.ts     # Supabase database types
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📚 Next Steps

1. Set up your Supabase database schema
2. Configure authentication if needed
3. Add your application logic
4. Deploy to Vercel or your preferred platform

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)