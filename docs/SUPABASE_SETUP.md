# Supabase Setup Guide

This guide will help you set up Supabase for the Menu for All application.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New project"
3. Choose your organization (or create one)
4. Set up your project:
   - **Name**: Menu for All
   - **Database Password**: Choose a strong password
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Start with the free tier

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon (public) key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ`) - keep this secure!

## 3. Set Up Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   
   # Optional: For server-side operations
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 4. Run Database Migrations

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase locally (optional):
   ```bash
   supabase init
   ```

3. Link to your remote project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Run the migration to create the database schema:
   ```bash
   supabase db push
   ```

   Or manually run the SQL from `supabase/migrations/001_initial_schema.sql` in your Supabase dashboard SQL editor.

## 5. Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any Supabase connection errors

3. You can test the connection by running:
   ```typescript
   import { testSupabaseConnection, testSupabaseAuth } from '@/lib/supabase/test-connection'
   
   // In your component or page
   useEffect(() => {
     testSupabaseConnection().then(console.log)
     testSupabaseAuth().then(console.log)
   }, [])
   ```

## 6. Enable Authentication Providers (Optional)

In your Supabase dashboard:

1. Go to **Authentication** > **Providers**
2. Configure the providers you want to use:
   - **Email**: Enabled by default
   - **Google**: Configure OAuth app
   - **GitHub**: Configure OAuth app
   - **Other providers**: As needed

## 7. Database Schema Overview

The application creates the following tables:

- **users**: Extended user profiles linked to auth.users
- **recipes**: Recipe data with ingredients, instructions, and metadata
- **user_saved_recipes**: Many-to-many relationship for saved recipes
- **pantry_items**: User's pantry inventory

## 8. Row Level Security (RLS)

The database is configured with Row Level Security to ensure:
- Users can only access their own data
- Recipes are publicly readable
- All write operations are properly authenticated

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Ensure your `.env.local` file has the correct variables
   - Restart your dev server after adding environment variables

2. **"Invalid JWT token"**
   - Check that your anon key is correct
   - Ensure the key hasn't been regenerated in your Supabase dashboard

3. **Database connection errors**
   - Verify your project URL is correct
   - Check that your project isn't paused (free tier limitation)

4. **Migration errors**
   - Ensure you have the correct permissions
   - Check that the migration SQL is valid
   - Verify your database password is correct

For more help, check the [Supabase documentation](https://supabase.com/docs) or the project issues.