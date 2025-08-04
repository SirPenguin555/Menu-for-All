# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-03-foundation-core-recipe-discovery/spec.md

> Created: 2025-08-03
> Version: 1.0.0

## Schema Overview

The database schema follows PostgreSQL best practices with proper indexing, constraints, and Row Level Security (RLS) policies for secure multi-tenant architecture.

## Core Tables

### users table (Extended from Supabase Auth)

```sql
-- Supabase handles the auth.users table automatically
-- We extend with a public.profiles table for additional user data

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (id),
  CONSTRAINT profiles_email_check CHECK (char_length(email) > 0),
  CONSTRAINT profiles_display_name_check CHECK (char_length(display_name) > 0)
);
```

### recipe_sources table

```sql
CREATE TABLE public.recipe_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  scraping_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT recipe_sources_name_check CHECK (char_length(name) > 0),
  CONSTRAINT recipe_sources_base_url_check CHECK (char_length(base_url) > 0)
);
```

### recipes table

```sql
CREATE TABLE public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.recipe_sources(id) ON DELETE CASCADE,
  source_recipe_id TEXT, -- Original ID from source site
  source_url TEXT NOT NULL,
  
  -- Core recipe data
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  servings INTEGER,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER,
  
  -- Ingredients stored as JSONB array for flexibility
  ingredients JSONB DEFAULT '[]',
  
  -- Instructions stored as JSONB array of steps
  instructions JSONB DEFAULT '[]',
  
  -- Metadata and categorization
  recipe_type TEXT, -- breakfast, lunch, dinner, snack, dessert
  difficulty_level TEXT, -- easy, medium, hard
  cuisine_type TEXT,
  
  -- Source attribution
  author_name TEXT,
  source_attribution TEXT NOT NULL,
  
  -- Timestamps
  source_published_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT recipes_title_check CHECK (char_length(title) > 0),
  CONSTRAINT recipes_source_url_check CHECK (char_length(source_url) > 0),
  CONSTRAINT recipes_servings_check CHECK (servings > 0),
  CONSTRAINT recipes_prep_time_check CHECK (prep_time_minutes >= 0),
  CONSTRAINT recipes_cook_time_check CHECK (cook_time_minutes >= 0),
  CONSTRAINT recipes_total_time_check CHECK (total_time_minutes >= 0),
  CONSTRAINT recipes_difficulty_check CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  CONSTRAINT recipes_type_check CHECK (recipe_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'))
);
```

### user_saved_recipes table

```sql
CREATE TABLE public.user_saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  UNIQUE (user_id, recipe_id)
);
```

## Indexes for Performance

```sql
-- Recipe search and filtering indexes
CREATE INDEX idx_recipes_title_gin ON recipes USING gin(to_tsvector('english', title));
CREATE INDEX idx_recipes_source_id ON recipes(source_id);
CREATE INDEX idx_recipes_recipe_type ON recipes(recipe_type);
CREATE INDEX idx_recipes_created_at_desc ON recipes(created_at DESC);
CREATE INDEX idx_recipes_total_time ON recipes(total_time_minutes) WHERE total_time_minutes IS NOT NULL;
CREATE INDEX idx_recipes_servings ON recipes(servings) WHERE servings IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX idx_recipes_type_time ON recipes(recipe_type, total_time_minutes);
CREATE INDEX idx_recipes_source_created ON recipes(source_id, created_at DESC);

-- User-related indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_saved_recipes_user_id ON user_saved_recipes(user_id);
CREATE INDEX idx_user_saved_recipes_saved_at ON user_saved_recipes(saved_at DESC);

-- Recipe sources indexes
CREATE INDEX idx_recipe_sources_active ON recipe_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_recipe_sources_last_scraped ON recipe_sources(last_scraped_at);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_recipes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Recipe sources policies (public read, admin write)
CREATE POLICY "Recipe sources are viewable by everyone" ON recipe_sources
  FOR SELECT USING (true);

-- Recipes policies (public read)
CREATE POLICY "Recipes are viewable by everyone" ON recipes
  FOR SELECT USING (true);

-- User saved recipes policies (private to user)
CREATE POLICY "Users can view own saved recipes" ON user_saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved recipes" ON user_saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved recipes" ON user_saved_recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes" ON user_saved_recipes
  FOR DELETE USING (auth.uid() = user_id);
```

## Database Functions and Triggers

```sql
-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_sources_updated_at BEFORE UPDATE ON recipe_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Data Migration Strategy

### Initial Data Population

```sql
-- Insert initial recipe sources
INSERT INTO recipe_sources (name, base_url, scraping_config, is_active) VALUES
('AllRecipes', 'https://www.allrecipes.com', '{"selectors": {"title": "h1", "ingredients": ".ingredients li", "instructions": ".instructions li"}}', true),
('Food Network', 'https://www.foodnetwork.com', '{"selectors": {"title": "h1.recipe-title", "ingredients": ".recipe-ingredients li", "instructions": ".recipe-instructions li"}}', true),
('Serious Eats', 'https://www.seriouseats.com', '{"selectors": {"title": "h1", "ingredients": ".ingredient", "instructions": ".instruction"}}', true);
```

### Schema Evolution

- Version control all schema changes with migration files
- Use Supabase CLI for local development migrations
- Implement rollback strategies for all schema changes
- Test migrations on staging environment before production deployment

## Performance Considerations

**Query Optimization**: All common query patterns have corresponding indexes to ensure sub-100ms response times for recipe listing and search

**Storage Optimization**: JSONB columns for ingredients and instructions provide flexibility while maintaining query performance with GIN indexes

**Connection Pooling**: Supabase handles connection pooling automatically, but monitor connection usage during high-traffic periods

**Archival Strategy**: Implement soft deletion for recipes to maintain referential integrity while allowing for data cleanup

## Security Measures

**Data Encryption**: All sensitive data encrypted at rest via Supabase's managed encryption

**Input Validation**: All user inputs validated at database level with CHECK constraints and application level with Zod schemas

**SQL Injection Prevention**: Parameterized queries enforced through Supabase client libraries

**Access Control**: RLS policies ensure users can only access their own data while maintaining public access to recipe content