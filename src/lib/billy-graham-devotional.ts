import { readJsonFromStorage } from './supabase-storage';

export interface BillyGrahamPage {
  angle: number;
  page_id: number;
  image_id: string;
  height: number;
  width: number;
  content: Array<{
    id: number;
    position: number[];
    score: number;
    text: string;
    type: string;
  }>;
}

export interface BillyGrahamBook {
  success_count: number;
  total_count: number;
  version: string;
  pages: BillyGrahamPage[];
}

export interface DailyDevotion {
  day: number;
  title: string;
  content: string;
  scripture: string;
  reflection: string;
  prayer?: string;
}

export interface ProcessedDevotion {
  day: number;
  title: string;
  verse_text: string;
  verse_reference: string;
  devotional_content: string;
  reflection: string;
  theme: string;
}

class BillyGrahamDevotionalService {
  private devotionalData: BillyGrahamBook | null = null;
  private processedDevotions: ProcessedDevotion[] = [];
  private readonly BUCKET_NAME = 'user-files';
  private readonly FILE_PATH = 'Billy Graham/living-in-christ-book.json';

  /**
   * Load the Billy Graham devotional data from Supabase Storage
   */
  async loadDevotionalData(): Promise<boolean> {
    try {
      const result = await readJsonFromStorage<BillyGrahamBook>(
        this.BUCKET_NAME,
        this.FILE_PATH
      );

      if (result.success && result.data) {
        this.devotionalData = result.data;
        this.processDevotionalContent();
        return true;
      } else {
        console.error('Failed to load Billy Graham devotional:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error loading devotional data:', error);
      return false;
    }
  }

  /**
   * Process the raw page data into structured daily devotions
   */
  private processDevotionalContent(): void {
    if (!this.devotionalData?.pages) return;

    const devotions: ProcessedDevotion[] = [];
    const pages = this.devotionalData.pages;
    
    // Extract meaningful content from pages
    const contentPages = pages.filter(page => 
      page.content && 
      page.content.length > 0 && 
      page.page_id > 2 && // Skip title/copyright pages
      page.page_id < 100   // Skip index/notes pages
    );

    // Group content into daily devotions (aim for 30 days)
    const pagesPerDevotion = Math.ceil(contentPages.length / 30);
    
    for (let day = 1; day <= 30; day++) {
      const startPageIndex = (day - 1) * pagesPerDevotion;
      const endPageIndex = Math.min(startPageIndex + pagesPerDevotion, contentPages.length);
      
      const dayPages = contentPages.slice(startPageIndex, endPageIndex);
      const processedDevotion = this.createDailyDevotion(day, dayPages);
      
      if (processedDevotion) {
        devotions.push(processedDevotion);
      }
    }

    this.processedDevotions = devotions;
  }

  /**
   * Create a single daily devotion from page content
   */
  private createDailyDevotion(day: number, pages: BillyGrahamPage[]): ProcessedDevotion | null {
    if (!pages.length) return null;

    const allText = pages.flatMap(page => 
      page.content
        .filter(content => content.type === 'paragraph' && content.text.length > 10)
        .map(content => content.text.trim())
    );

    if (allText.length === 0) return null;

    // Extract scripture references (look for patterns like "John 3:16", "Psalm 23:1", etc.)
    const scripturePattern = /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Songs|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+:\d+(?:-\d+)?/gi;
    
    const foundScriptures = allText.join(' ').match(scripturePattern) || [];
    const primaryScripture = foundScriptures[0] || `Day ${day} Devotion`;

    // Find the actual verse text (usually quoted text or longer paragraphs)
    const verseText = allText.find(text => 
      text.length > 50 && 
      (text.includes('"') || text.includes('"') || text.includes('"'))
    ) || allText.find(text => text.length > 100) || allText[0] || '';

    // Extract devotional content (longer paragraphs that aren't verse text)
    const devotionalContent = allText
      .filter(text => text !== verseText && text.length > 30)
      .slice(0, 3) // Take first 3 paragraphs for devotional content
      .join(' ');

    // Create reflection from Billy Graham's insights
    const reflection = allText
      .filter(text => text !== verseText && text !== devotionalContent && text.length > 20)
      .slice(0, 2)
      .join(' ') || devotionalContent;

    const themes = [
      'Faith and Trust', 'Love and Compassion', 'Hope and Encouragement', 
      'Peace and Rest', 'Wisdom and Guidance', 'Strength and Courage',
      'Gratitude and Praise', 'Forgiveness and Grace', 'Joy and Celebration',
      'Prayer and Worship', 'Service and Purpose', 'Growth and Transformation'
    ];

    return {
      day,
      title: `Day ${day}: Living in Christ`,
      verse_text: this.cleanText(verseText),
      verse_reference: primaryScripture,
      devotional_content: this.cleanText(devotionalContent),
      reflection: this.cleanText(reflection),
      theme: themes[(day - 1) % themes.length]
    };
  }

  /**
   * Clean and format text content
   */
  private cleanText(text: string): string {
    return text
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Get devotion for a specific day (1-30)
   */
  async getDevotionForDay(day: number): Promise<ProcessedDevotion | null> {
    // Ensure data is loaded
    if (this.processedDevotions.length === 0) {
      await this.loadDevotionalData();
    }

    if (day < 1 || day > 30) {
      console.warn(`Day ${day} is out of range (1-30)`);
      return null;
    }

    return this.processedDevotions.find(d => d.day === day) || null;
  }

  /**
   * Get today's devotion based on the day of the month (cycles every 30 days)
   */
  async getTodaysVerse(): Promise<ProcessedDevotion | null> {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const devotionalDay = ((dayOfMonth - 1) % 30) + 1; // Cycle through 1-30
    
    return this.getDevotionForDay(devotionalDay);
  }

  /**
   * Get all 30 devotions
   */
  async getAllDevotions(): Promise<ProcessedDevotion[]> {
    if (this.processedDevotions.length === 0) {
      await this.loadDevotionalData();
    }
    return this.processedDevotions;
  }

  /**
   * Search devotions by keyword
   */
  async searchDevotions(keyword: string): Promise<ProcessedDevotion[]> {
    if (this.processedDevotions.length === 0) {
      await this.loadDevotionalData();
    }

    const searchTerm = keyword.toLowerCase();
    return this.processedDevotions.filter(devotion => 
      devotion.title.toLowerCase().includes(searchTerm) ||
      devotion.verse_text.toLowerCase().includes(searchTerm) ||
      devotion.devotional_content.toLowerCase().includes(searchTerm) ||
      devotion.reflection.toLowerCase().includes(searchTerm) ||
      devotion.theme.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get devotions by theme
   */
  async getDevotionsByTheme(theme: string): Promise<ProcessedDevotion[]> {
    if (this.processedDevotions.length === 0) {
      await this.loadDevotionalData();
    }

    return this.processedDevotions.filter(devotion => 
      devotion.theme.toLowerCase() === theme.toLowerCase()
    );
  }

  /**
   * Force refresh the devotional data from storage
   */
  async refreshData(): Promise<boolean> {
    this.devotionalData = null;
    this.processedDevotions = [];
    return this.loadDevotionalData();
  }
}

// Export a singleton instance
export const billyGrahamDevotional = new BillyGrahamDevotionalService(); 