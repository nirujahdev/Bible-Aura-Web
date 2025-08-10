import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSEO } from '@/hooks/useSEO';
import { ModernLayout } from '@/components/ModernLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, BookOpen, Users, Crown, TreePine, Library, 
  Heart, Star, Share, Languages, Grid, Filter,
  ChevronDown, Plus, Eye, ExternalLink, 
  PenTool, Lightbulb, Globe, Clock, Settings,
  ChevronLeft, ChevronRight, BookmarkPlus,
  MessageSquare, Sparkles, Send, Save, X,
  FileText, Tag, Calendar, TrendingUp, ArrowLeft,
  StickyNote, Bookmark, Beaker, BookCheck, PanelRightClose, PanelRightOpen,
  Bold, Italic, List, Quote, Type, FileDown, Copy,
  BookMarked, Scroll, AlignLeft, AlignCenter, Palette
} from 'lucide-react';

// Import individual study components
import { PrayerStudy } from '@/studies/topical/Prayer';
import { JesusStudy } from '@/studies/characters/Jesus';
import { GoodSamaritanStudy } from '@/studies/parables/GoodSamaritan';

// SEO Configuration for Study Hub
const SEO_CONFIG = {
  title: "Study Hub - Comprehensive Bible Study Tools | Bible Aura",
  description: "Explore in-depth Bible studies with our comprehensive Study Hub. Access topical studies, character profiles, and parable explanations to deepen your faith journey.",
  keywords: "bible study, topical study, bible characters, parables, spiritual growth, christian education",
  ogTitle: "Study Hub - Deep Bible Study Made Simple",
  ogDescription: "Access comprehensive Bible study tools including topical studies, character profiles, and parable explanations. Perfect for personal study and group discussions."
};

const StudyHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // SEO optimization
  useSEO(SEO_CONFIG);

  const [activeSection, setActiveSection] = useState('topical');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // Current study state
  const [currentStudy, setCurrentStudy] = useState<{type: string, id: string} | null>(null);
  
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [savingJournal, setSavingJournal] = useState(false);
  
  // Enhanced Journal State
  const [activeJournalTab, setActiveJournalTab] = useState('write');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fontSize, setFontSize] = useState('14');
  const [notesTitle, setNotesTitle] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [notesCategory, setNotesCategory] = useState('study');
  const [notesTags, setNotesTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [createPurpose, setCreatePurpose] = useState('');
  const [researchReferences, setResearchReferences] = useState('');
  const [wordCount, setWordCount] = useState(0);
  
  // Bible Integration State
  const [showBibleModal, setShowBibleModal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState('KJV');
  const [bibleBook, setBibleBook] = useState('');
  const [bibleChapter, setBibleChapter] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');

  // Journal Templates
  const journalTemplates = {
    'bible-study': {
      name: 'Bible Study',
      template: `PASSAGE: [Book Chapter:Verse]

CONTEXT:
Historical background and setting

OBSERVATION:
What does the text say?

INTERPRETATION:
What does the text mean?

APPLICATION:
How does this apply to my life today?

KEY INSIGHTS:
Main takeaways and lessons learned

PRAYER POINTS:
How this guides my prayer life`
    },
    'sermon-notes': {
      name: 'Sermon Notes',
      template: `SERMON: [Title]
SPEAKER: [Pastor/Speaker Name]
DATE: [Date]
PASSAGE: [Scripture Reference]

MAIN POINTS:
1. 
2. 
3. 

KEY QUOTES:
[Notable quotes from the sermon]

PERSONAL REFLECTIONS:
How does this message speak to me?

ACTION STEPS:
What will I do differently this week?`
    },
    'prayer-journal': {
      name: 'Prayer Journal',
      template: `DATE: [Today's Date]

PRAISE:
Things I'm grateful for and praising God about

CONFESSION:
Areas where I need God's forgiveness

THANKSGIVING:
Specific blessings I'm thankful for

SUPPLICATION:
Prayer requests for myself and others

SCRIPTURE PRAYER:
Praying God's Word back to Him

ANSWERED PRAYERS:
How God has been faithful`
    },
    'character-study': {
      name: 'Character Study',
      template: `CHARACTER: [Name]
SCRIPTURE REFERENCES: [Key passages]

BACKGROUND:
Historical context and life situation

CHARACTER TRAITS:
Positive and negative qualities observed

KEY EVENTS:
Major moments in their biblical narrative

LESSONS LEARNED:
What can I learn from their life?

MODERN APPLICATION:
How does their example apply today?

REFLECTION:
Personal thoughts and takeaways`
    },
    'topical-study': {
      name: 'Topical Study',
      template: `TOPIC: [Study Topic]

DEFINITION:
What does the Bible say about this topic?

KEY VERSES:
Primary scriptures related to this topic

THEMES:
Major biblical themes and patterns

CROSS-REFERENCES:
Related passages and concepts

PERSONAL APPLICATION:
How does this topic apply to my life?

STUDY QUESTIONS:
Questions for deeper reflection`
    },
    'personal-reflection': {
      name: 'Personal Reflection',
      template: `DATE: [Date]

CURRENT SITUATION:
What's happening in my life right now?

SCRIPTURE MEDITATION:
What is God saying to me through His Word?

SPIRITUAL INSIGHTS:
What is the Holy Spirit revealing?

AREAS OF GROWTH:
Where do I need to mature spiritually?

COMMITMENTS:
What am I committing to do?

PRAYER:
My conversation with God about these things`
    }
  };

  // Bible Translations
  const bibleTranslations = [
    { value: 'KJV', label: 'King James Version (KJV)' },
    { value: 'NIV', label: 'New International Version (NIV)' },
    { value: 'ESV', label: 'English Standard Version (ESV)' },
    { value: 'NLT', label: 'New Living Translation (NLT)' },
    { value: 'NASB', label: 'New American Standard Bible (NASB)' },
    { value: 'NKJV', label: 'New King James Version (NKJV)' },
    { value: 'WEB', label: 'World English Bible (WEB)' },
    { value: 'ASV', label: 'American Standard Version (ASV)' }
  ];

  // Bible Books (simplified list)
  const bibleBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
    'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
    'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
    'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  // Update word count
  useEffect(() => {
    const totalWords = (notesTitle + ' ' + createPurpose + ' ' + notesContent).trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(totalWords);
  }, [notesTitle, createPurpose, notesContent]);

  // Apply Template
  const applyTemplate = (templateKey: string) => {
    if (journalTemplates[templateKey]) {
      setNotesContent(journalTemplates[templateKey].template);
      setNotesTitle(`${journalTemplates[templateKey].name} - ${new Date().toLocaleDateString()}`);
    }
  };

  // Format Text Functions
  const insertFormat = (format: string) => {
    const textarea = document.querySelector('[data-journal-content]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notesContent.substring(start, end);
    
    let newText = notesContent;
    let formatText = '';

    switch (format) {
      case 'bold':
        formatText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formatText = `*${selectedText || 'italic text'}*`;
        break;
      case 'bullet':
        formatText = selectedText ? `\n- ${selectedText}` : '\n- ';
        break;
      case 'quote':
        formatText = selectedText ? `\n> ${selectedText}` : '\n> ';
        break;
      case 'verse':
        formatText = selectedText ? `\n"${selectedText}" - [Reference]` : '\n"[Verse text]" - [Reference]';
        break;
    }

    newText = notesContent.substring(0, start) + formatText + notesContent.substring(end);
    setNotesContent(newText);
    
    // Refocus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formatText.length, start + formatText.length);
    }, 0);
  };

  // Add verse to journal
  const addVerseToJournal = () => {
    if (selectedVerse && bibleBook && bibleChapter && bibleVerse) {
      const verseText = `\n\n"${selectedVerse}" - ${bibleBook} ${bibleChapter}:${bibleVerse} (${selectedTranslation})\n\n`;
      setNotesContent(prev => prev + verseText);
      setShowBibleModal(false);
      toast({
        title: "Verse Added",
        description: "Bible verse has been added to your journal entry."
      });
    }
  };

  // Enhanced Topical Study Data with more depth
  const topicalStudies = [
    {
      id: 'prayer',
      title: 'Prayer & Intercession',
      subtitle: 'Spiritual Disciplines',
      description: 'Discover the power of prayer through biblical examples, different prayer types, and practical applications for daily spiritual growth.',
      verseCount: 127,
      keyVerses: ['Matthew 6:9-13', '1 Thessalonians 5:17', 'James 5:16'],
      category: 'Spiritual Growth',
      difficulty: 'Beginner',
      estimatedTime: '45 min',
      tags: ['prayer', 'worship', 'intercession', 'spiritual-discipline'],
      insights: [
        'Jesus taught us to pray with the Lord\'s Prayer as our model',
        'Paul encourages continuous prayer in all circumstances',
        'Effective prayer involves faith, persistence, and alignment with God\'s will'
      ]
    },
    {
      id: 'faith',
      title: 'Faith & Trust',
      subtitle: 'Core Biblical Foundations',
      description: 'Explore biblical faith through the stories of great faith heroes and understand how to apply faith principles in modern life.',
      verseCount: 89,
      keyVerses: ['Hebrews 11:1', 'Romans 10:17', 'James 2:17'],
      category: 'Foundation',
      difficulty: 'Intermediate',
      estimatedTime: '60 min',
      tags: ['faith', 'trust', 'belief', 'foundation'],
      insights: [
        'Faith is confidence in God\'s promises even when unseen',
        'Faith comes through hearing God\'s word',
        'True faith is demonstrated through actions and works'
      ]
    },
    {
      id: 'love',
      title: 'Divine Love & Relationships',
      subtitle: 'Character & Relationships',
      description: 'Understand God\'s unconditional love and learn how to express Christ-like love in all relationships.',
      verseCount: 156,
      keyVerses: ['1 John 4:8', '1 Corinthians 13:4-7', 'John 3:16'],
      category: 'Relationships',
      difficulty: 'Beginner',
      estimatedTime: '50 min',
      tags: ['love', 'relationships', 'agape', 'compassion'],
      insights: [
        'God is love - it\'s His very nature and essence',
        'Love is patient, kind, and seeks the good of others',
        'God\'s love for humanity motivated the ultimate sacrifice'
      ]
    },
    {
      id: 'wisdom',
      title: 'Biblical Wisdom & Decision Making',
      subtitle: 'Practical Living',
      description: 'Gain biblical wisdom for life decisions through Proverbs, Ecclesiastes, and the teachings of Jesus.',
      verseCount: 98,
      keyVerses: ['Proverbs 9:10', 'James 1:5', 'Colossians 2:3'],
      category: 'Knowledge',
      difficulty: 'Advanced',
      estimatedTime: '75 min',
      tags: ['wisdom', 'decisions', 'proverbs', 'discernment'],
      insights: [
        'The fear of the Lord is the beginning of wisdom',
        'God generously gives wisdom to those who ask',
        'All treasures of wisdom are found in Christ'
      ]
    },
    {
      id: 'hope',
      title: 'Hope & Future Promise',
      subtitle: 'Eternal Perspective',
      description: 'Discover the hope we have in Christ and how it transforms our perspective on trials and eternity.',
      verseCount: 84,
      keyVerses: ['Romans 15:13', '1 Peter 1:3', 'Jeremiah 29:11'],
      category: 'Future',
      difficulty: 'Intermediate',
      estimatedTime: '55 min',
      tags: ['hope', 'future', 'promises', 'eternity'],
      insights: [
        'God fills believers with joy and peace through hope',
        'We have a living hope through Christ\'s resurrection',
        'God has plans for our welfare and future'
      ]
    },
    {
      id: 'forgiveness',
      title: 'Forgiveness & Redemption',
      subtitle: 'Grace & Mercy',
      description: 'Learn about God\'s forgiveness and how to extend forgiveness to others through biblical examples.',
      verseCount: 72,
      keyVerses: ['Ephesians 4:32', 'Matthew 6:14-15', '1 John 1:9'],
      category: 'Grace',
      difficulty: 'Intermediate',
      estimatedTime: '65 min',
      tags: ['forgiveness', 'redemption', 'grace', 'mercy'],
      insights: [
        'We forgive others as God has forgiven us',
        'Forgiveness is essential for receiving God\'s forgiveness',
        'God is faithful to forgive when we confess our sins'
      ]
    }
  ];

  // Enhanced Bible Characters with more detail
  const bibleCharacters = [
    {
      id: 'moses',
      name: 'Moses',
      role: 'Prophet & Lawgiver',
      testament: 'Old Testament',
      timeframe: '1393-1273 BC',
      description: 'The great prophet who led the Israelites out of Egypt, received the Ten Commandments, and established the foundation of Jewish law.',
      traits: ['Humble', 'Faithful', 'Patient', 'Leader', 'Intercession'],
      notableEvents: ['Burning Bush Encounter', 'Ten Plagues of Egypt', 'Exodus from Egypt', 'Receiving the Ten Commandments', 'Parting the Red Sea', '40 Years in Wilderness'],
      lessons: [
        'God uses ordinary people for extraordinary purposes',
        'Humility is essential for effective leadership',
        'Intercession for others reflects God\'s heart'
      ],
      color: 'bg-blue-100 text-blue-800',
      icon: '👑',
      keyVerses: ['Exodus 3:10', 'Numbers 12:3', 'Deuteronomy 34:10'],
      modernApplication: 'Leaders today can learn about servant leadership, intercession, and trusting God through difficulties.'
    },
    {
      id: 'jesus',
      name: 'Jesus Christ',
      role: 'Savior & Lord',
      testament: 'New Testament',
      timeframe: '4 BC - 30 AD',
      description: 'The Son of God, Savior of the world, who came to earth to redeem humanity through His perfect life, sacrificial death, and victorious resurrection.',
      traits: ['Perfect Love', 'Compassion', 'Wisdom', 'Humility', 'Obedience', 'Forgiveness'],
      notableEvents: ['Incarnation', 'Ministry & Teaching', 'Crucifixion', 'Resurrection', 'Ascension'],
      lessons: [
        'Perfect love demonstrated through sacrifice',
        'Servant leadership is true greatness',
        'Forgiveness extends even to enemies',
        'Obedience to God\'s will brings life'
      ],
      color: 'bg-purple-100 text-purple-800',
      icon: '✝️',
      keyVerses: ['John 3:16', 'John 14:6', 'Philippians 2:6-8'],
      modernApplication: 'Jesus is our perfect example of love, sacrifice, and obedience to God.'
    },
    {
      id: 'esther',
      name: 'Esther',
      role: 'Queen & Deliverer',
      testament: 'Old Testament',
      timeframe: '519-465 BC',
      description: 'Jewish queen of Persia who courageously risked her life to save the Jewish people from destruction.',
      traits: ['Brave', 'Wise', 'Beautiful', 'Strategic', 'Faithful'],
      notableEvents: ['Chosen as Queen', 'Fast and Prayer', 'Revealing Her Identity', 'Saving the Jewish People', 'Establishment of Purim'],
      lessons: [
        'God positions us for His purposes',
        'Courage is required to stand for what\'s right',
        'Prayer and fasting prepare us for action'
      ],
      color: 'bg-yellow-100 text-yellow-800',
      icon: '👸',
      keyVerses: ['Esther 4:14', 'Esther 7:3', 'Esther 9:28'],
      modernApplication: 'Christians can learn about using their influence for justice and standing up for the oppressed.'
    },
    {
      id: 'paul',
      name: 'Paul (Saul)',
      role: 'Apostle & Missionary',
      testament: 'New Testament',
      timeframe: '5-67 AD',
      description: 'Former persecutor of Christians who became the greatest missionary and church planter, writing much of the New Testament.',
      traits: ['Zealous', 'Transformed', 'Dedicated', 'Bold', 'Scholarly'],
      notableEvents: ['Road to Damascus Conversion', 'Three Missionary Journeys', 'Church Planting', 'Prison Ministry', 'Writing Epistles'],
      lessons: [
        'God can transform anyone, regardless of their past',
        'Suffering often accompanies effective ministry',
        'The Gospel is for all people, not just one group'
      ],
      color: 'bg-orange-100 text-orange-800',
      icon: '✍️',
      keyVerses: ['Acts 9:15', 'Philippians 3:7-8', '2 Corinthians 12:9'],
      modernApplication: 'Modern Christians can learn about evangelism, church leadership, and persevering through trials.'
    }
  ];

  // Enhanced Parables with deeper insights
  const parables = [
    {
      id: 'good-samaritan',
      title: 'The Good Samaritan',
      theme: 'Love & Compassion',
      reference: 'Luke 10:25-37',
      difficulty: 2,
      summary: 'Jesus tells the story of a Samaritan who showed mercy to a Jewish man beaten by robbers, demonstrating true neighborly love.',
      modernApplication: 'Help others regardless of their background, race, or social status. True love crosses all boundaries.',
      keyLessons: ['Show mercy to all people', 'Love transcends social barriers', 'Actions prove our faith'],
      historicalContext: 'Jews and Samaritans had centuries of ethnic and religious tension, making this story shocking to Jesus\' audience.',
      practicalSteps: [
        'Look for opportunities to help those in need',
        'Overcome prejudices and stereotypes',
        'Be willing to invest time and resources in others'
      ],
      reflectionQuestions: [
        'Who are the "Samaritans" in your life?',
        'What prevents you from showing mercy to others?',
        'How can you be a better neighbor?'
      ],
      stars: '⭐⭐'
    },
    {
      id: 'prodigal-son',
      title: 'The Prodigal Son',
      theme: 'Forgiveness & Grace',
      reference: 'Luke 15:11-32',
      difficulty: 3,
      summary: 'A story of a wayward son who squanders his inheritance but returns home to find his father\'s unconditional love and forgiveness.',
      modernApplication: 'God always welcomes us back with open arms when we repent, no matter how far we\'ve wandered.',
      keyLessons: ['God\'s forgiveness is unlimited', 'Repentance leads to restoration', 'Grace triumphs over judgment'],
      historicalContext: 'In Jewish culture, asking for inheritance early was like wishing your father dead - an ultimate insult.',
      practicalSteps: [
        'Return to God when you\'ve strayed',
        'Forgive others as God has forgiven you',
        'Celebrate when others come to faith'
      ],
      reflectionQuestions: [
        'Are you more like the younger or older son?',
        'What keeps you from fully accepting God\'s grace?',
        'How can you extend grace to others?'
      ],
      stars: '⭐⭐⭐'
    },
    {
      id: 'mustard-seed',
      title: 'The Mustard Seed',
      theme: 'Kingdom Growth',
      reference: 'Matthew 13:31-32',
      difficulty: 2,
      summary: 'Jesus compares God\'s kingdom to a tiny mustard seed that grows into a large tree, showing how small beginnings can have huge impact.',
      modernApplication: 'Don\'t despise small beginnings. God can use small acts of faith to accomplish great things.',
      keyLessons: ['Small faith can grow exponentially', 'God\'s kingdom starts small but spreads', 'Patience is required for growth'],
      historicalContext: 'Mustard seeds were the smallest seeds known to farmers in ancient Palestine, yet grew into large shrubs.',
      practicalSteps: [
        'Start with small acts of faith',
        'Be patient with spiritual growth',
        'Trust God with the results'
      ],
      reflectionQuestions: [
        'What small seeds of faith can you plant today?',
        'How has God grown small beginnings in your life?',
        'Where do you need patience in your spiritual journey?'
      ],
      stars: '⭐⭐'
    }
  ];

  const navigationTabs = [
    { id: 'topical', name: 'Topical Studies', icon: Library, count: topicalStudies.length },
    { id: 'characters', name: 'Bible Characters', icon: Users, count: bibleCharacters.length },
    { id: 'parables', name: 'Parables', icon: TreePine, count: parables.length }
  ];

  const handleStudyNow = (item: any) => {
    // Determine the study type and ID
    let studyType = '';
    let studyId = item.id;

    if (activeSection === 'topical') {
      studyType = 'topical';
    } else if (activeSection === 'characters') {
      studyType = 'characters';
    } else if (activeSection === 'parables') {
      studyType = 'parables';
    }

    setCurrentStudy({ type: studyType, id: studyId });
    
    // Auto-populate journal with study info
    setNotesTitle(`Study: ${item.title || item.name}`);
    setCreatePurpose(`Study session for ${item.title || item.name}`);
    setNotesContent(`• Key insights from this study\n• Main takeaways\n• Personal reflections`);

    // Auto-open sidebar when starting a study
    setIsSidebarOpen(true);
  };

  const handleBackToOverview = () => {
    setCurrentStudy(null);
  };

  const handleAddToJournal = (item: any) => {
    setNotesTitle(`Study Notes: ${item.title || item.name}`);
    setCreatePurpose(`Study session for ${item.title || item.name}`);
    setNotesContent(`Study started for: ${item.title || item.name}\n\n• Key insights:\n• Main takeaways:\n• Personal reflections:`);
    setIsSidebarOpen(true); // Open sidebar when adding to journal
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Journal saving functions - FIXED to actually save to database
  const handleSaveNotes = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save journal entries.",
        variant: "destructive"
      });
      return;
    }

    if (!notesTitle || !notesContent) {
      toast({
        title: "Missing Information",
        description: "Please add both a title and notes before saving.",
        variant: "destructive"
      });
      return;
    }

    setSavingJournal(true);
    
    try {
      const dataToSave = {
        user_id: user.id,
        title: notesTitle.trim(),
        content: notesContent.trim(),
        verse_reference: researchReferences.trim() || null,
        verse_text: null,
        verse_references: researchReferences.trim() ? [researchReferences.trim()] : [],
        category: notesCategory,
        tags: notesTags,
        mood: null,
        spiritual_state: null,
        is_private: true,
        metadata: {
          description: createPurpose.trim() || null,
          study_type: 'study_hub',
          reflection_type: 'study'
        },
        language: 'english',
        entry_date: new Date().toISOString().split('T')[0],
        word_count: notesContent.trim().split(/\s+/).length,
        reading_time: Math.max(1, Math.ceil(notesContent.trim().split(/\s+/).length / 200)),
        is_pinned: false,
        template_used: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('journal_entries')
        .insert([dataToSave]);

      if (error) {
        console.error('Error saving journal entry:', error);
        if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
          throw new Error('You do not have permission to create journal entries. Please sign out and sign back in.');
        }
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          throw new Error('Database schema issue. Please refresh the page and try again.');
        }
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          throw new Error('Database table is missing. Please contact support.');
        }
        throw new Error(error.message || 'Failed to create journal entry');
      }

      toast({
        title: "Journal Entry Saved",
        description: "Your study notes have been saved to your journal successfully!"
      });
      
      // Reset form
      setNotesTitle('');
      setNotesContent('');
      setCreatePurpose('');
      setResearchReferences('');
      setNotesTags([]);
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error Saving Entry",
        description: error.message || "Failed to save your journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingJournal(false);
    }
  };

  // Functions removed since we now have a single simplified journal form

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !notesTags.includes(newTag.trim())) {
      setNotesTags([...notesTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNotesTags(notesTags.filter(tag => tag !== tagToRemove));
  };

  const filteredParables = parables.filter(parable => {
    const matchesSearch = parable.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         parable.theme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || parable.difficulty.toString() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Render individual study component
  const renderStudyComponent = () => {
    if (!currentStudy) return null;

    const { type, id } = currentStudy;

    switch (type) {
      case 'topical':
        if (id === 'prayer') return <PrayerStudy onBack={handleBackToOverview} />;
        break;
      case 'characters':
        if (id === 'jesus') return <JesusStudy onBack={handleBackToOverview} />;
        break;
      case 'parables':
        if (id === 'good-samaritan') return <GoodSamaritanStudy onBack={handleBackToOverview} />;
        break;
    }

    // Fallback for studies not yet implemented
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBackToOverview} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Study Component</h1>
            <p className="text-lg text-gray-600">Coming Soon - {type} study for {id}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Study in Development</h3>
            <p className="text-gray-600 mb-4">
              This detailed study is being prepared and will be available soon.
            </p>
            <Button onClick={handleBackToOverview}>
              Back to Study Overview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Enhanced Journal Sidebar with Tabs and Templates
  const renderEnhancedJournalSidebar = () => (
    <div className={`${isSidebarOpen ? 'w-80 lg:w-96 xl:w-[420px] opacity-100' : 'w-0 opacity-0'} bg-white border-l border-gray-200 flex flex-col shadow-xl sticky top-0 h-screen transition-all duration-500 ease-in-out overflow-hidden`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-gray-50 to-orange-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <PenTool className="h-5 w-5 text-orange-500" />
          Enhanced Journal
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {wordCount} words
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <Tabs value={activeJournalTab} onValueChange={setActiveJournalTab} className="flex-1 flex flex-col">
            <TabsList className="w-full rounded-none border-b bg-gray-50">
              <TabsTrigger value="write" className="flex-1 text-xs">
                <PenTool className="h-3 w-3 mr-1" />
                Write
              </TabsTrigger>
              <TabsTrigger value="verses" className="flex-1 text-xs">
                <BookMarked className="h-3 w-3 mr-1" />
                Verses
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Write Tab */}
            <TabsContent value="write" className="flex-1 flex flex-col overflow-hidden mt-0">
              <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                {/* Template Selector */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Template</label>
                  <Select value={selectedTemplate} onValueChange={(value) => {
                    setSelectedTemplate(value);
                    if (value) applyTemplate(value);
                  }}>
                    <SelectTrigger className="text-sm bg-white/80">
                      <SelectValue placeholder="Choose a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(journalTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>{template.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Title</label>
                  <Input
                    placeholder="Enter your journal title..."
                    value={notesTitle}
                    onChange={(e) => setNotesTitle(e.target.value)}
                    className="text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>

                {/* Writing Toolbar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-900">Content</label>
                    <div className="flex items-center gap-1">
                      <Select value={fontSize} onValueChange={setFontSize}>
                        <SelectTrigger className="w-16 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12px</SelectItem>
                          <SelectItem value="14">14px</SelectItem>
                          <SelectItem value="16">16px</SelectItem>
                          <SelectItem value="18">18px</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Format Buttons */}
                  <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-50 rounded-lg border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertFormat('bold')}
                      className="h-7 px-2"
                      title="Bold"
                    >
                      <Bold className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertFormat('italic')}
                      className="h-7 px-2"
                      title="Italic"
                    >
                      <Italic className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertFormat('bullet')}
                      className="h-7 px-2"
                      title="Bullet List"
                    >
                      <List className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => insertFormat('quote')}
                      className="h-7 px-2"
                      title="Quote"
                    >
                      <Quote className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowBibleModal(true)}
                      className="h-7 px-2 bg-orange-100 text-orange-600 hover:bg-orange-200"
                      title="Add Bible Verse"
                    >
                      <BookMarked className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                  <Textarea
                    data-journal-content
                    placeholder="Start writing your thoughts, insights, and reflections here..."
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    className={`flex-1 min-h-[350px] lg:min-h-[400px] resize-none border-gray-300 focus:border-orange-400 focus:ring-orange-400 bg-white/90`}
                    style={{ 
                      fontSize: `${fontSize}px`, 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      lineHeight: '1.6'
                    }}
                  />
                </div>

                {/* Category & Tags */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Category</label>
                    <Select value={notesCategory} onValueChange={setNotesCategory}>
                      <SelectTrigger className="text-sm bg-white/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="study">Bible Study</SelectItem>
                        <SelectItem value="reflection">Personal Reflection</SelectItem>
                        <SelectItem value="prayer">Prayer Points</SelectItem>
                        <SelectItem value="insight">Divine Insight</SelectItem>
                        <SelectItem value="question">Questions</SelectItem>
                        <SelectItem value="sermon">Sermon Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Quick Tag</label>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="text-xs bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                      />
                      <Button size="sm" onClick={addTag} className="bg-orange-500 hover:bg-orange-600 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags Display */}
                {notesTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {notesTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} <X className="h-2 w-2 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={handleSaveNotes}
                    disabled={savingJournal}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {savingJournal ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Entry
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="px-3">
                    <FileDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Verses Tab */}
            <TabsContent value="verses" className="flex-1 flex flex-col overflow-hidden mt-0">
              <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Bible Explorer</h3>
                  
                  {/* Translation Selector */}
                  <div className="mb-3">
                    <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bibleTranslations.map((translation) => (
                          <SelectItem key={translation.value} value={translation.value}>
                            {translation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Book, Chapter, Verse Selectors */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <Select value={bibleBook} onValueChange={setBibleBook}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Book" />
                      </SelectTrigger>
                      <SelectContent>
                        {bibleBooks.map((book) => (
                          <SelectItem key={book} value={book} className="text-xs">
                            {book}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="Ch."
                      value={bibleChapter}
                      onChange={(e) => setBibleChapter(e.target.value)}
                      className="text-xs"
                    />
                    
                    <Input
                      placeholder="V."
                      value={bibleVerse}
                      onChange={(e) => setBibleVerse(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  {/* Verse Text Input */}
                  <Textarea
                    placeholder="Paste or type the verse text here..."
                    value={selectedVerse}
                    onChange={(e) => setSelectedVerse(e.target.value)}
                    className="min-h-[100px] text-sm"
                  />

                  {/* Add Verse Button */}
                  <Button
                    onClick={addVerseToJournal}
                    disabled={!selectedVerse || !bibleBook || !bibleChapter || !bibleVerse}
                    className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
                  >
                    <BookMarked className="h-4 w-4 mr-2" />
                    Add to Journal
                  </Button>
                </div>

                {/* Recent Verses */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent References</h4>
                  <div className="text-xs text-gray-500">
                    Your recently added verses will appear here
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="flex-1 flex flex-col overflow-hidden mt-0">
              <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Notes & References</h3>
                  
                  {/* Purpose/Description */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Study Purpose</label>
                    <Textarea
                      placeholder="What is the purpose or goal of this study session?"
                      value={createPurpose}
                      onChange={(e) => setCreatePurpose(e.target.value)}
                      className="min-h-[80px] resize-none text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>

                  {/* Scripture References */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Scripture References</label>
                    <Input
                      placeholder="e.g. John 3:16, Matthew 5:1-12, Romans 8:28"
                      value={researchReferences}
                      onChange={(e) => setResearchReferences(e.target.value)}
                      className="text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>

                  {/* Study Stats */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Session Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Word Count:</span>
                        <span className="font-medium ml-1">{wordCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium ml-1">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );

  // If viewing individual study, render it with journal sidebar
  if (currentStudy) {
    return (
      <ModernLayout>
        <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-white relative">
          {/* Main Study Content - Responsive width based on sidebar */}
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${!isSidebarOpen ? 'max-w-6xl mx-auto px-8' : ''}`}>
            {renderStudyComponent()}
          </div>

          {/* Journal Sidebar Toggle Button (when closed) */}
          {!isSidebarOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className="fixed top-20 right-4 z-50 bg-white shadow-lg"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          )}

          {/* Permanent Right Sidebar - Collapsible Journal */}
          {renderEnhancedJournalSidebar()}
        </div>
      </ModernLayout>
    );
  }

  // Main overview interface
  return (
    <ModernLayout>
      <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-white relative">
        
        {/* Main Content Area - Enhanced Responsive Layout for 3-Column Design */}
        <div className={`flex-1 overflow-y-auto transition-all duration-500 ease-in-out ${
          !isSidebarOpen 
            ? 'max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16' 
            : 'px-3 sm:px-4 lg:px-6 xl:px-8 max-w-none'
        }`}>
          {/* Top Navigation Bar - Sticky */}
                      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className={`mx-auto transition-all duration-300 ${
              !isSidebarOpen ? 'px-4 sm:px-6 lg:px-8' : 'px-3 sm:px-4 lg:px-6'
            }`}>
              <div className="flex items-center justify-between h-16">
                
                {/* Left - Study Hub Title */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Library className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Study Hub</h1>
                    <p className="text-sm text-gray-600">Advanced Bible Study Tools</p>
                  </div>
                </div>

                {/* Center - Navigation Tabs */}
                <div className="hidden lg:flex">
                  <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                    <TabsList className="bg-gray-100">
                      {navigationTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex items-center gap-2 px-4 py-2"
                          >
                            <Icon className="h-4 w-4" />
                            {tab.name}
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {tab.count}
                            </Badge>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Right - Search & Journal Toggle */}
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSidebar}
                    className="flex items-center gap-2 transition-all duration-300 hover:bg-orange-50 hover:border-orange-300"
                  >
                    {isSidebarOpen ? (
                      <>
                        <PanelRightClose className="h-4 w-4 transition-transform duration-300" />
                        <span className="hidden sm:inline">Close Journal</span>
                      </>
                    ) : (
                      <>
                        <PanelRightOpen className="h-4 w-4 transition-transform duration-300" />
                        <span className="hidden sm:inline">Open Journal</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation & Search */}
              <div className="lg:hidden pb-4 space-y-3">
                <div className="relative sm:hidden">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search studies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-50 border-0 focus:bg-white"
                  />
                </div>
                <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                  <TabsList className="w-full bg-gray-100">
                    {navigationTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex-1 flex items-center gap-1 text-xs"
                        >
                          <Icon className="h-3 w-3" />
                          <span className="hidden xs:inline">{tab.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {tab.count}
                          </Badge>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Study Content - Enhanced Responsive Container for Optimal Study Experience */}
          <div className={`mx-auto py-6 sm:py-8 lg:py-10 transition-all duration-500 ${
            !isSidebarOpen 
              ? 'px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 max-w-full' 
              : 'px-3 sm:px-4 lg:px-6 xl:px-8 max-w-6xl'
          }`}>
            
            {/* TOPICAL STUDIES */}
            {activeSection === 'topical' && (
              <div className="space-y-8">
                
                {/* Search and Filter Bar - Enhanced for Research */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search topical studies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Levels</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Studies Grid - Optimized 3-Column Layout for Study & Research */}
                <div className={`grid gap-6 lg:gap-8 transition-all duration-500 ${
                  !isSidebarOpen 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3' 
                    : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                }`}>
                  {topicalStudies
                    .filter(study => 
                      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .filter(study => 
                      difficultyFilter === 'All' || study.difficulty === difficultyFilter
                    )
                    .map((study) => (
                      <Card key={study.id} className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/95 relative overflow-hidden">
                        {/* Background gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <CardHeader className="pb-4 relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={study.difficulty === 'Beginner' ? 'default' : 
                                         study.difficulty === 'Intermediate' ? 'secondary' : 'destructive'} 
                                  className="text-xs font-medium"
                                >
                                  {study.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {study.estimatedTime}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg font-bold text-gray-900 leading-tight group-hover:text-orange-700 transition-colors duration-300">
                                {study.title}
                              </CardTitle>
                              <p className="text-sm text-orange-600 font-medium">{study.category}</p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-2xl font-bold text-orange-500">{study.verseCount}</div>
                              <p className="text-xs text-gray-500 font-medium">verses</p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-5 relative z-10">
                          <div>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{study.description}</p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Key Insights</p>
                            <div className="space-y-1">
                              {study.insights.slice(0, 2).map((insight, index) => (
                                <div key={index} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                  <span className="text-orange-500 mt-1 text-xs">➤</span>
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900 mb-2">Key Verses</p>
                            <div className="flex flex-wrap gap-1">
                              {study.keyVerses.slice(0, 3).map((verse, index) => (
                                <Badge key={index} variant="outline" className="text-xs text-orange-600 border-orange-200">
                                  {verse}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-2">
                            {study.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleStudyNow(study)}
                                className="bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <BookOpen className="h-3 w-3 mr-2" />
                                Study Now
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToJournal(study)}
                                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Journal
                              </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                              <Share className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* BIBLE CHARACTERS */}
            {activeSection === 'characters' && (
              <div className="space-y-8">
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search biblical characters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80">
                        <SelectValue placeholder="All Characters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Characters</SelectItem>
                        <SelectItem value="1">Major Figures</SelectItem>
                        <SelectItem value="2">Prophets</SelectItem>
                        <SelectItem value="3">Kings & Leaders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Characters Grid - Optimized 3-Column Layout */}
                <div className={`grid gap-6 lg:gap-8 transition-all duration-500 ${
                  !isSidebarOpen 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3' 
                    : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                }`}>
                  {bibleCharacters.map((character) => (
                    <Card key={character.id} className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/95 relative overflow-hidden">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{character.name}</CardTitle>
                            <p className="text-sm text-blue-600 font-medium mt-1">{character.testament}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{character.role}</p>
                          </div>
                                                     <div className="text-right">
                             <div className="text-lg">{character.icon}</div>
                             <Badge variant="outline" className="text-xs mt-1">
                               {character.testament === 'Old Testament' ? 'OT' : 'NT'}
                             </Badge>
                           </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 relative z-10">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Background</p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{character.description}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Lessons</p>
                          <div className="space-y-1">
                            {character.lessons.slice(0, 2).map((lesson, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                <span className="text-blue-500 mt-1">➤</span>
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Verses</p>
                          <div className="flex flex-wrap gap-1">
                            {character.keyVerses.slice(0, 3).map((verse, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-blue-600 border-blue-200">
                                {verse}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyNow(character)}
                              className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <BookOpen className="h-3 w-3 mr-2" />
                              Study
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToJournal(character)}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Journal
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-500">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* PARABLES */}
            {activeSection === 'parables' && (
              <div className="space-y-8">
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search parables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-full lg:w-40 bg-white/80">
                        <SelectValue placeholder="All Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Difficulty</SelectItem>
                        <SelectItem value="1">Beginner</SelectItem>
                        <SelectItem value="2">Intermediate</SelectItem>
                        <SelectItem value="3">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Enhanced Parables Grid - Optimized 3-Column Layout */}
                <div className={`grid gap-6 lg:gap-8 transition-all duration-500 ${
                  !isSidebarOpen 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3' 
                    : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                }`}>
                  {filteredParables.map((parable) => (
                    <Card key={parable.id} className="group hover:shadow-2xl transition-all duration-500 ease-in-out border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-[1.02] hover:bg-white/95 relative overflow-hidden">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">{parable.title}</CardTitle>
                            <p className="text-sm text-green-600 font-medium mt-1">{parable.theme}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{parable.reference}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{parable.stars}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              Level {parable.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 relative z-10">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Summary</p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{parable.summary}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Modern Application</p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{parable.modernApplication}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Key Lessons</p>
                          <div className="space-y-1">
                            {parable.keyLessons.slice(0, 2).map((lesson, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                <span className="text-green-500 mt-1">➤</span>
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Historical Context</p>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{parable.historicalContext}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStudyNow(parable)}
                              className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <BookOpen className="h-3 w-3 mr-2" />
                              Study
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToJournal(parable)}
                              className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Journal
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Journal Sidebar - Better Width Management */}
        <div className={`${isSidebarOpen ? 'w-80 lg:w-96 xl:w-[420px] opacity-100' : 'w-0 opacity-0'} bg-white border-l border-gray-200 flex flex-col shadow-xl sticky top-0 h-screen transition-all duration-500 ease-in-out overflow-hidden`}>
          <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-gray-50 to-orange-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PenTool className="h-5 w-5 text-orange-500" />
              Study Journal
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isSidebarOpen && (
            <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Title</label>
                <Input
                  placeholder="Enter study title..."
                  value={notesTitle}
                  onChange={(e) => setNotesTitle(e.target.value)}
                  className="text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Description</label>
                <Textarea
                  placeholder="Brief description of your study..."
                  value={createPurpose}
                  onChange={(e) => setCreatePurpose(e.target.value)}
                  className="min-h-[80px] resize-none text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              {/* Verse Reference */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Verse Reference</label>
                <Input
                  placeholder="e.g. John 3:16, Matthew 5:1-12"
                  value={researchReferences}
                  onChange={(e) => setResearchReferences(e.target.value)}
                  className="text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              {/* Study Points */}
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-medium text-gray-900 mb-2 block">Key Points & Insights</label>
                <Textarea
                  placeholder="• Key point 1&#10;• Key point 2&#10;• Key point 3&#10;&#10;Add your insights, reflections, and main takeaways here..."
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  className="flex-1 min-h-[300px] lg:min-h-[350px] resize-none text-sm bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Category</label>
                <Select value={notesCategory} onValueChange={setNotesCategory}>
                  <SelectTrigger className="text-sm bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Bible Study</SelectItem>
                    <SelectItem value="reflection">Personal Reflection</SelectItem>
                    <SelectItem value="prayer">Prayer Points</SelectItem>
                    <SelectItem value="insight">Divine Insight</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                    <SelectItem value="sermon">Sermon Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="text-xs bg-white/80 border-gray-300 focus:border-orange-400 focus:ring-orange-400"
                  />
                  <Button size="sm" onClick={addTag} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {notesTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} <X className="h-2 w-2 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveNotes}
                disabled={savingJournal}
                className="bg-orange-500 hover:bg-orange-600 w-full disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-300"
              >
                {savingJournal ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Journal Entry
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {/* Enhanced Journal Sidebar Toggle Button (when closed) */}
        {!isSidebarOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="fixed top-20 right-4 z-50 bg-white shadow-xl hover:shadow-2xl border-2 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 animate-pulse hover:animate-none"
          >
            <PanelRightOpen className="h-4 w-4 text-orange-500" />
            <span className="sr-only">Open Journal</span>
          </Button>
        )}
      </div>
    </ModernLayout>
  );
};

export default StudyHub; 