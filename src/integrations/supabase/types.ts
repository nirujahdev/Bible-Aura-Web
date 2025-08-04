
export interface Parable {
  id: string;
  title: string;
  theme: string;
  scripture_reference: string;
  story_breakdown: {
    setting: string;
    conflict: string;
    characters: Array<{
      role: string;
      description: string;
    }>;
    compassion_in_action?: string[];
  };
  historical_context: {
    [key: string]: string;
  };
  theological_insights: {
    [key: string]: string;
  };
  spiritual_lessons: {
    [key: string]: string;
  };
  modern_applications: {
    practical_steps: string[];
    modern_contexts: string[];
  };
  reflective_questions: string[];
  cross_references: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  target_audience: 'children' | 'youth' | 'adults' | 'general' | 'new_believers' | 'mature_believers';
  study_duration: number;
  language: 'english' | 'tamil' | 'sinhala';
  tags: string[];
  author?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface ParableStudy {
  id: string;
  user_id: string;
  parable_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'bookmarked';
  progress: number;
  personal_notes?: string;
  insights: {
    [key: string]: any;
  };
  prayer_requests?: string[];
  applications_tried?: string[];
  rating?: number;
  study_date: string;
  time_spent: number;
  created_at: string;
  updated_at: string;
  parable?: Parable;
}

export interface ParableDiscussion {
  id: string;
  parable_id: string;
  user_id: string;
  discussion_type: 'insight' | 'question' | 'application' | 'testimony' | 'prayer_request';
  title?: string;
  content: string;
  parent_id?: string;
  likes_count: number;
  replies_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  parable?: Parable;
  user?: {
    email: string;
    full_name?: string;
  };
  replies?: ParableDiscussion[];
}

export interface ParableStats {
  id: string;
  title: string;
  theme: string;
  difficulty_level: string;
  target_audience: string;
  total_studies: number;
  completed_studies: number;
  average_rating: number;
  average_study_time: number;
}

export interface BibleCharacter {
  id: string;
  name: string;
  alt_names?: string[];
  brief_description: string;
  detailed_biography?: string;
  key_verses?: string[];
  testament: 'Old' | 'New' | 'Both';
  time_period?: string;
  occupation_role?: string;
  character_traits?: string[];
  key_lessons?: string[];
  modern_applications?: string;
  cross_references?: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  study_duration: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CharacterStudy {
  id: string;
  user_id: string;
  character_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  personal_notes?: string;
  study_date: string;
  time_spent: number;
  created_at: string;
  updated_at: string;
  character?: BibleCharacter;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title?: string;
  messages: any[];
  mode: string;
  language: string;
  translation: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description?: string;
  duration_days: number;
  plan_data: any;
  is_active: boolean;
  created_at: string;
}

export interface UserReadingProgress {
  id: string;
  user_id: string;
  plan_id: string;
  current_day: number;
  completed_days: number[];
  started_at: string;
  last_read_at?: string;
  completed_at?: string;
}

export interface ConsolidatedBookmark {
  id: string;
  user_id: string;
  verse_id: string;
  book_name?: string;
  chapter?: number;
  verse?: number;
  verse_text?: string;
  verse_reference?: string;
  notes?: string;
  tags: string[];
  color: string;
  is_favorite: boolean;
  category: string;
  highlight_color: string;
  created_at: string;
  updated_at: string;
}

