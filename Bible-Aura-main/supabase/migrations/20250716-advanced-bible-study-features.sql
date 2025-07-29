-- Advanced Bible Study Features Migration
-- Topic-by-Topic Verse Organization System

-- Create theological topics table
CREATE TABLE public.theological_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_topic_id UUID REFERENCES public.theological_topics(id),
  category TEXT NOT NULL, -- Main categories like 'Salvation', 'Prayer', 'Leadership', etc.
  level INTEGER DEFAULT 1, -- Hierarchy level (1=main topic, 2=subtopic, 3=specific theme)
  verse_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create topic-verse relationships table
CREATE TABLE public.topic_verses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.theological_topics(id) ON DELETE CASCADE,
  verse_id UUID NOT NULL REFERENCES public.bible_verses(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  context_notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(topic_id, verse_id)
);

-- Create topic cross-references table
CREATE TABLE public.topic_cross_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_topic_id UUID NOT NULL REFERENCES public.theological_topics(id) ON DELETE CASCADE,
  related_topic_id UUID NOT NULL REFERENCES public.theological_topics(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'related' CHECK (relationship_type IN ('related', 'opposite', 'prerequisite', 'continuation')),
  strength INTEGER DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(primary_topic_id, related_topic_id)
);

-- Famous Preacher Sermons Archive

-- Create preachers table
CREATE TABLE public.preachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  biography TEXT,
  theological_tradition TEXT,
  era TEXT NOT NULL CHECK (era IN ('Classic', 'Modern', 'Contemporary')),
  nationality TEXT,
  denominational_affiliation TEXT,
  notable_works TEXT[],
  photo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create famous sermons table
CREATE TABLE public.famous_sermons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preacher_id UUID NOT NULL REFERENCES public.preachers(id),
  title TEXT NOT NULL,
  scripture_reference TEXT,
  verse_references UUID[],
  content_text TEXT,
  audio_url TEXT,
  video_url TEXT,
  transcript TEXT,
  sermon_date DATE,
  location TEXT,
  occasion TEXT,
  duration_minutes INTEGER,
  themes TEXT[],
  theological_points JSONB,
  rhetorical_analysis JSONB,
  historical_context TEXT,
  series_name TEXT,
  series_order INTEGER,
  language TEXT DEFAULT 'English',
  translation_used TEXT DEFAULT 'KJV',
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sermon topics relationship
CREATE TABLE public.sermon_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sermon_id UUID NOT NULL REFERENCES public.famous_sermons(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.theological_topics(id) ON DELETE CASCADE,
  prominence INTEGER DEFAULT 5 CHECK (prominence BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sermon_id, topic_id)
);

-- Comprehensive Parables Database

-- Create parables table
CREATE TABLE public.parables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  alternative_titles TEXT[],
  scripture_reference TEXT NOT NULL,
  verse_references UUID[],
  parable_text TEXT NOT NULL,
  context TEXT,
  historical_setting TEXT,
  cultural_background TEXT,
  geographical_context TEXT,
  audience TEXT,
  occasion TEXT,
  main_theme TEXT NOT NULL,
  secondary_themes TEXT[],
  kingdom_aspect TEXT,
  moral_lesson TEXT,
  practical_application TEXT,
  symbolic_elements JSONB,
  interpretive_challenges TEXT,
  rabbinical_parallels TEXT,
  old_testament_parallels TEXT[],
  ministry_period TEXT CHECK (ministry_period IN ('Early', 'Middle', 'Late')),
  difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  target_age_group TEXT DEFAULT 'All Ages',
  study_questions TEXT[],
  discussion_prompts TEXT[],
  visual_aids_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parable interpretations table
CREATE TABLE public.parable_interpretations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parable_id UUID NOT NULL REFERENCES public.parables(id) ON DELETE CASCADE,
  interpretation_title TEXT NOT NULL,
  interpreter_name TEXT,
  interpreter_tradition TEXT,
  interpretation_text TEXT NOT NULL,
  interpretation_type TEXT CHECK (interpretation_type IN ('allegorical', 'moral', 'eschatological', 'christological', 'practical')),
  theological_perspective TEXT,
  date_interpreted DATE,
  scholarly_level TEXT DEFAULT 'intermediate' CHECK (scholarly_level IN ('beginner', 'intermediate', 'advanced', 'scholarly')),
  citations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create parable cross-references table
CREATE TABLE public.parable_cross_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_parable_id UUID NOT NULL REFERENCES public.parables(id) ON DELETE CASCADE,
  related_parable_id UUID NOT NULL REFERENCES public.parables(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'thematic' CHECK (relationship_type IN ('thematic', 'sequential', 'contrasting', 'parallel')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(primary_parable_id, related_parable_id)
);

-- User Interaction Tables

-- Create user topic bookmarks
CREATE TABLE public.user_topic_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.theological_topics(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Create user sermon bookmarks
CREATE TABLE public.user_sermon_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sermon_id UUID NOT NULL REFERENCES public.famous_sermons(id) ON DELETE CASCADE,
  notes TEXT,
  timestamp_bookmarks JSONB, -- For audio/video bookmarks
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sermon_id)
);

-- Create user parable study progress
CREATE TABLE public.user_parable_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parable_id UUID NOT NULL REFERENCES public.parables(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'reviewed')),
  study_notes TEXT,
  favorite_interpretation_id UUID REFERENCES public.parable_interpretations(id),
  study_time_minutes INTEGER DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, parable_id)
);

-- Custom Collections
CREATE TABLE public.custom_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT NOT NULL CHECK (collection_type IN ('topics', 'sermons', 'parables', 'mixed')),
  is_public BOOLEAN DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]', -- Array of {type, id} objects
  color_theme TEXT DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.theological_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.famous_sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parable_interpretations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parable_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sermon_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_parable_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_collections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access to content
CREATE POLICY "Theological topics are viewable by everyone" ON public.theological_topics FOR SELECT USING (true);
CREATE POLICY "Topic verses are viewable by everyone" ON public.topic_verses FOR SELECT USING (true);
CREATE POLICY "Topic cross references are viewable by everyone" ON public.topic_cross_references FOR SELECT USING (true);
CREATE POLICY "Preachers are viewable by everyone" ON public.preachers FOR SELECT USING (true);
CREATE POLICY "Famous sermons are viewable by everyone" ON public.famous_sermons FOR SELECT USING (true);
CREATE POLICY "Sermon topics are viewable by everyone" ON public.sermon_topics FOR SELECT USING (true);
CREATE POLICY "Parables are viewable by everyone" ON public.parables FOR SELECT USING (true);
CREATE POLICY "Parable interpretations are viewable by everyone" ON public.parable_interpretations FOR SELECT USING (true);
CREATE POLICY "Parable cross references are viewable by everyone" ON public.parable_cross_references FOR SELECT USING (true);

-- Create RLS policies for user-specific content
CREATE POLICY "Users can manage their own topic bookmarks" ON public.user_topic_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sermon bookmarks" ON public.user_sermon_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own parable progress" ON public.user_parable_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own collections" ON public.custom_collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public collections are viewable by everyone" ON public.custom_collections FOR SELECT USING (is_public = true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_theological_topics_updated_at
  BEFORE UPDATE ON public.theological_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preachers_updated_at
  BEFORE UPDATE ON public.preachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_famous_sermons_updated_at
  BEFORE UPDATE ON public.famous_sermons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parables_updated_at
  BEFORE UPDATE ON public.parables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_parable_progress_updated_at
  BEFORE UPDATE ON public.user_parable_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_collections_updated_at
  BEFORE UPDATE ON public.custom_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_theological_topics_category ON public.theological_topics(category);
CREATE INDEX idx_theological_topics_parent ON public.theological_topics(parent_topic_id);
CREATE INDEX idx_topic_verses_topic ON public.topic_verses(topic_id);
CREATE INDEX idx_topic_verses_verse ON public.topic_verses(verse_id);
CREATE INDEX idx_topic_verses_relevance ON public.topic_verses(relevance_score DESC);
CREATE INDEX idx_preachers_era ON public.preachers(era);
CREATE INDEX idx_famous_sermons_preacher ON public.famous_sermons(preacher_id);
CREATE INDEX idx_famous_sermons_themes ON public.famous_sermons USING GIN(themes);
CREATE INDEX idx_famous_sermons_date ON public.famous_sermons(sermon_date);
CREATE INDEX idx_parables_theme ON public.parables(main_theme);
CREATE INDEX idx_parables_difficulty ON public.parables(difficulty_level);
CREATE INDEX idx_parables_ministry_period ON public.parables(ministry_period);
CREATE INDEX idx_parable_interpretations_type ON public.parable_interpretations(interpretation_type);
CREATE INDEX idx_user_topic_bookmarks_user ON public.user_topic_bookmarks(user_id);
CREATE INDEX idx_user_sermon_bookmarks_user ON public.user_sermon_bookmarks(user_id);
CREATE INDEX idx_custom_collections_user ON public.custom_collections(user_id);
CREATE INDEX idx_custom_collections_type ON public.custom_collections(collection_type);

-- Full-text search indexes
CREATE INDEX idx_theological_topics_search ON public.theological_topics USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_famous_sermons_search ON public.famous_sermons USING GIN(to_tsvector('english', title || ' ' || COALESCE(content_text, '')));
CREATE INDEX idx_parables_search ON public.parables USING GIN(to_tsvector('english', title || ' ' || main_theme || ' ' || COALESCE(practical_application, ''))); 