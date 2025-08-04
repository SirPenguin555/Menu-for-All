-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'dessert');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  dietary_restrictions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions JSONB NOT NULL DEFAULT '[]',
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  difficulty_level difficulty_level,
  cuisine_type TEXT,
  meal_type meal_type,
  dietary_tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  source_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_saved_recipes table (many-to-many relationship)
CREATE TABLE public.user_saved_recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, recipe_id)
);

-- Create pantry_items table
CREATE TABLE public.pantry_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL,
  unit TEXT,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_meal_type ON public.recipes(meal_type);
CREATE INDEX idx_recipes_dietary_tags ON public.recipes USING GIN(dietary_tags);
CREATE INDEX idx_recipes_difficulty ON public.recipes(difficulty_level);
CREATE INDEX idx_recipes_title ON public.recipes(title);
CREATE INDEX idx_user_saved_recipes_user_id ON public.user_saved_recipes(user_id);
CREATE INDEX idx_pantry_items_user_id ON public.pantry_items(user_id);
CREATE INDEX idx_pantry_items_ingredient ON public.pantry_items(ingredient_name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pantry_items_updated_at BEFORE UPDATE ON public.pantry_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Recipes table policies (public read access)
CREATE POLICY "Anyone can view recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert recipes" ON public.recipes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update recipes" ON public.recipes FOR UPDATE TO authenticated USING (true);

-- User saved recipes policies
CREATE POLICY "Users can view own saved recipes" ON public.user_saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved recipes" ON public.user_saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved recipes" ON public.user_saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- Pantry items policies
CREATE POLICY "Users can view own pantry items" ON public.pantry_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pantry items" ON public.pantry_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pantry items" ON public.pantry_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pantry items" ON public.pantry_items FOR DELETE USING (auth.uid() = user_id);

-- Function to handle user profile creation after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();