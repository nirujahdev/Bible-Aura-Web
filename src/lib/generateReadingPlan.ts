// Generate deterministic Bible reading plans

import bibleStructure from '@/data/bibleStructure.json';
import { ReadingPlanDay, ReadingPlanPreferences, ReadingPlan } from './storage';

const OLD_TESTAMENT_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
];

const NEW_TESTAMENT_BOOKS = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const THEME_PACKS = {
  'Faith': ['Hebrews', 'James', 'Romans', 'Galatians', 'Ephesians'],
  'Prayer': ['Psalms', '1 Timothy', '2 Timothy', 'Philippians', 'James'],
  "Jesus' Teachings": ['Matthew', 'Mark', 'Luke', 'John'],
  'Wisdom': ['Proverbs', 'Ecclesiastes', 'James', 'Job', 'Psalms']
};

export const generateReadingPlan = (preferences: ReadingPlanPreferences): ReadingPlan => {
  // 1. Select books based on scope
  let selectedBooks: string[] = [];
  
  switch (preferences.scope) {
    case 'Whole Bible':
      selectedBooks = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];
      break;
    case 'Old Testament':
      selectedBooks = [...OLD_TESTAMENT_BOOKS];
      break;
    case 'New Testament':
      selectedBooks = [...NEW_TESTAMENT_BOOKS];
      break;
    case 'Specific Books':
      selectedBooks = preferences.specificBooks || [];
      break;
    default:
      // Theme pack
      selectedBooks = THEME_PACKS[preferences.scope as keyof typeof THEME_PACKS] || [];
  }

  // 2. Calculate total chapters
  const totalChapters = selectedBooks.reduce((sum, book) => {
    return sum + (bibleStructure[book as keyof typeof bibleStructure] || 0);
  }, 0);

  // 3. Calculate reading days
  const weeksNeeded = Math.ceil(preferences.duration / 7);
  const totalReadingDays = Math.min(
    weeksNeeded * preferences.daysPerWeek,
    preferences.duration
  );

  // 4. Determine chapters per day based on reading size
  let chaptersPerDay: number;
  switch (preferences.readingSize) {
    case 'Short':
      chaptersPerDay = 1;
      break;
    case 'Medium':
      chaptersPerDay = 2;
      break;
    case 'Deep':
      chaptersPerDay = 4;
      break;
    case 'Auto':
    default:
      chaptersPerDay = Math.max(1, Math.ceil(totalChapters / totalReadingDays));
  }

  // 5. Generate daily readings
  const days: ReadingPlanDay[] = [];
  let currentDay = 1;
  let bookIndex = 0;
  let chapterIndex = 1;

  while (bookIndex < selectedBooks.length && currentDay <= totalReadingDays) {
    const book = selectedBooks[bookIndex];
    const totalChaptersInBook = bibleStructure[book as keyof typeof bibleStructure] || 0;
    const reading: string[] = [];

    // Add chapters for this day
    for (let i = 0; i < chaptersPerDay && bookIndex < selectedBooks.length; i++) {
      const currentBook = selectedBooks[bookIndex];
      const chaptersInCurrentBook = bibleStructure[currentBook as keyof typeof bibleStructure] || 0;

      if (chapterIndex <= chaptersInCurrentBook) {
        reading.push(`${currentBook} ${chapterIndex}`);
        chapterIndex++;
      }

      // Move to next book if finished current one
      if (chapterIndex > chaptersInCurrentBook) {
        bookIndex++;
        chapterIndex = 1;
      }
    }

    if (reading.length > 0) {
      days.push({
        day: currentDay,
        reading,
        completed: false
      });
      currentDay++;
    } else {
      break;
    }
  }

  // Create the plan
  const plan: ReadingPlan = {
    preferences,
    days,
    createdAt: new Date().toISOString(),
    startDate: new Date().toISOString().split('T')[0]
  };

  return plan;
};

export const getBooksForScope = (scope: string): string[] => {
  switch (scope) {
    case 'Whole Bible':
      return [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];
    case 'Old Testament':
      return [...OLD_TESTAMENT_BOOKS];
    case 'New Testament':
      return [...NEW_TESTAMENT_BOOKS];
    default:
      return THEME_PACKS[scope as keyof typeof THEME_PACKS] || [];
  }
};

export const getAllBooks = (): string[] => {
  return [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];
};

export const getThemePacks = (): string[] => {
  return Object.keys(THEME_PACKS);
};

