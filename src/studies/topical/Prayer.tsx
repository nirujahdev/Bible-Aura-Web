import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Heart, Star, Clock, Users, 
  ChevronRight, Play, Pause, CheckCircle,
  MessageCircle, Lightbulb, Target, ArrowLeft,
  Download, Share, Bookmark, Timer, Award,
  Quote, Zap, Globe, Eye, Brain, Sparkles,
  FileText, Trophy, Calendar, PenTool
} from 'lucide-react';

interface PrayerStudyProps {
  onBack: () => void;
}

export const PrayerStudy: React.FC<PrayerStudyProps> = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [studyTime, setStudyTime] = useState(0);
  const [isStudying, setIsStudying] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStudying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const studyData = {
    title: "Prayer & Intercession",
    subtitle: "Spiritual Disciplines Masterclass",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    verseCount: 127,
    tags: ['prayer', 'worship', 'intercession', 'spiritual-discipline', 'communion', 'ACTS'],
    description: "Discover the transformative power of prayer through biblical examples, different prayer types, and practical applications that will revolutionize your daily spiritual growth and deepen your relationship with God.",
    
    keyVerses: [
      {
        reference: "Matthew 6:9-13",
        text: "Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one.",
        insight: "Jesus teaches us the perfect prayer model: worship, submission, provision, forgiveness, and protection. Notice how God's glory comes before our needs.",
        practicalTip: "Use this as a template: spend equal time on each element rather than rushing to requests."
      },
      {
        reference: "1 Thessalonians 5:17",
        text: "Pray continually, rejoice always, give thanks in all circumstances.",
        insight: "Paul reveals that prayer isn't just scheduled moments but a continuous attitude of heart communion with God throughout our day.",
        practicalTip: "Set hourly reminders on your phone with simple prayers like 'God, I trust You' or 'Thank You, Lord.'"
      },
      {
        reference: "James 5:16",
        text: "The prayer of a righteous person is powerful and effective.",
        insight: "Our prayers have supernatural power when our hearts are aligned with God's righteousness - not perfect performance, but surrendered hearts.",
        practicalTip: "Before praying, ask: 'God, show me any area of my heart that needs alignment with Yours.'"
      },
      {
        reference: "Philippians 4:6-7",
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
        insight: "Prayer is God's antidote to anxiety. When we bring everything to Him with gratitude, supernatural peace becomes our guard.",
        practicalTip: "For every worry, immediately say: 'God, I give this to You and thank You for [something related].'"
      },
      {
        reference: "Hebrews 4:16",
        text: "Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need.",
        insight: "We can approach God boldly - not because we're perfect, but because Jesus has made us welcome in the throne room of grace.",
        practicalTip: "Picture yourself walking confidently into God's presence, knowing you're His beloved child who always has access."
      }
    ],

    sections: [
      {
        title: "Understanding Prayer",
        duration: "12 min",
        icon: Brain,
        color: "from-blue-500 to-blue-600",
        content: {
          overview: "Prayer is far more than asking God for things - it's the foundational relationship that transforms everything else. Understanding what prayer really is will revolutionize how you approach God and experience His presence.",
          keyPoints: [
            "Prayer is intimate conversation with your Heavenly Father, not religious performance",
            "God desires relationship more than perfect words or techniques",
            "Prayer changes us first, then our circumstances - we align with God's heart",
            "Every prayer is heard and treasured by God, even if answers look different than expected",
            "Prayer is both talking and listening - creating space for God to speak to us"
          ],
          bibleExamples: [
            {
              person: "Abraham",
              reference: "Genesis 18:22-33",
              lesson: "Boldly interceding for others, even bargaining with God shows the intimacy He desires"
            },
            {
              person: "Moses",
              reference: "Exodus 33:11",
              lesson: "God spoke to Moses face to face, as one speaks to a friend - this intimacy is available to us"
            }
          ],
          practicalApplication: "This week, start each prayer with: 'God, I'm here to spend time with You' rather than immediately making requests. Notice how this changes your prayer experience.",
          exercise: "Spend 5 minutes in prayer without asking for anything - just telling God who He is and expressing love for Him."
        }
      },
      {
        title: "The ACTS Model",
        duration: "15 min",
        icon: Target,
        color: "from-green-500 to-green-600",
        content: {
          overview: "ACTS (Adoration, Confession, Thanksgiving, Supplication) provides a biblical framework that ensures balanced, powerful prayer while preventing us from turning prayer into just a wish list.",
          keyPoints: [
            "ADORATION: Praising God for His character, not just what He does for us",
            "CONFESSION: Honest acknowledgment of sin that opens the door to forgiveness and freedom",
            "THANKSGIVING: Gratitude that shifts our perspective and opens our hearts to see God's goodness",
            "SUPPLICATION: Requests for ourselves and others, offered with trust in God's perfect wisdom"
          ],
          bibleExamples: [
            {
              person: "David",
              reference: "Psalm 139:1-24",
              lesson: "Perfect example of ACTS - worship, confession, gratitude, and requests woven together"
            },
            {
              person: "Daniel",
              reference: "Daniel 9:3-19",
              lesson: "Powerful prayer combining worship, confession for his people, and bold requests"
            }
          ],
          practicalApplication: "Dedicate 5 minutes to each element of ACTS for one week. Time yourself to ensure balanced prayer rather than rushing to requests.",
          exercise: "Write out a prayer using ACTS, spending at least 2 sentences on each element. Use this as a template for future prayers."
        }
      },
      {
        title: "Biblical Prayer Heroes",
        duration: "18 min",
        icon: Award,
        color: "from-purple-500 to-purple-600",
        content: {
          overview: "Learn from biblical giants who cultivated extraordinary prayer lives. Their examples show us that powerful prayer isn't about perfect words but persistent, faithful hearts seeking God.",
          keyPoints: [
            "DANIEL: Consistent daily prayer despite persecution - prayers that shaped kingdoms",
            "NEHEMIAH: Quick 'arrow prayers' in crisis moments combined with planned prayer times",
            "JESUS: Regular withdrawal for extended prayer - the source of His power and peace",
            "PAUL: Constant prayer for others - his letters reveal a heart always interceding",
            "HANNAH: Desperate, honest prayer that moved the heart of God and changed history"
          ],
          bibleExamples: [
            {
              person: "Daniel",
              reference: "Daniel 6:10",
              lesson: "Three times daily prayer, even facing death - prayer was more important than safety"
            },
            {
              person: "Jesus",
              reference: "Luke 5:16",
              lesson: "Even in busy ministry, Jesus withdrew regularly to pray - if He needed it, how much more do we?"
            },
            {
              person: "Nehemiah",
              reference: "Nehemiah 2:4",
              lesson: "Quick prayers in critical moments while also maintaining regular prayer times"
            }
          ],
          practicalApplication: "Choose one biblical prayer hero this week. Study their prayer habits and implement one specific practice they used.",
          exercise: "Create a prayer schedule inspired by your chosen hero. Start with just 3 times this week, then build from there."
        }
      },
      {
        title: "Overcoming Prayer Barriers",
        duration: "15 min",
        icon: Zap,
        color: "from-orange-500 to-orange-600",
        content: {
          overview: "Every believer faces obstacles in prayer, but God has provided solutions for each barrier. Understanding these helps us break through to deeper, more consistent prayer lives.",
          keyPoints: [
            "DISTRACTION: Our minds wander - create sacred space and use prayer tools",
            "DOUBT: Questions about God's goodness - remember His past faithfulness",
            "UNANSWERED PRAYER: When God seems silent - trust His perfect timing and wisdom",
            "BUSYNESS: No time for prayer - start small and build sustainable habits",
            "GUILT: Feeling unworthy to approach God - remember you're welcome because of Jesus"
          ],
          bibleExamples: [
            {
              person: "Elijah",
              reference: "1 Kings 19:4-18",
              lesson: "Even prophets feel discouraged - God meets us gently and restores our hearts"
            },
            {
              person: "Thomas",
              reference: "John 20:24-29",
              lesson: "Jesus welcomes our doubts and provides evidence to strengthen our faith"
            }
          ],
          practicalApplication: "Identify your biggest prayer obstacle from the list above. This week, implement one specific strategy to overcome it and track your progress.",
          exercise: "Write down your prayer struggles honestly, then find one Bible verse that addresses each struggle. Pray these verses back to God."
        }
      },
      {
        title: "Prayer in Daily Life",
        duration: "10 min",
        icon: Globe,
        color: "from-teal-500 to-teal-600",
        content: {
          overview: "Transform ordinary moments into prayer opportunities. Learning to pray throughout your day creates a lifestyle of continuous communion with God that brings peace and purpose to every activity.",
          keyPoints: [
            "MORNING: Start each day surrendering your agenda to God's perfect plan",
            "COMMUTING: Turn travel time into worship and intercession time",
            "WORK: Quick prayers for wisdom, patience, and opportunities to serve others",
            "CHALLENGES: Immediate prayer transforms problems into opportunities for God's power",
            "EVENING: Gratitude and review prayers that end your day in God's peace"
          ],
          bibleExamples: [
            {
              person: "Nehemiah",
              reference: "Nehemiah 2:4",
              lesson: "Arrow prayers in the moment - instant connection with God in every situation"
            },
            {
              person: "Jesus",
              reference: "Mark 1:35",
              lesson: "Early morning prayer set the tone for powerful, purposeful days"
            }
          ],
          practicalApplication: "Set 3 prayer alarms on your phone for different daily activities. Use these as prompts to connect with God throughout your day.",
          exercise: "Keep a prayer journal for one week, noting how God answers both your planned prayers and spontaneous prayers throughout each day."
        }
      }
    ],

    reflectionQuestions: [
      {
        question: "Which aspect of prayer feels most challenging for you right now, and why?",
        purpose: "Identify personal barriers to overcome"
      },
      {
        question: "How has your understanding of prayer changed through this study?",
        purpose: "Recognize growth and new insights"
      },
      {
        question: "Which part of ACTS (Adoration, Confession, Thanksgiving, Supplication) do you tend to neglect most?",
        purpose: "Balance your prayer life"
      },
      {
        question: "What practical changes will you commit to making in your prayer life this week?",
        purpose: "Turn learning into action"
      },
      {
        question: "How might deeper prayer transform your relationships with others?",
        purpose: "Connect prayer to daily life"
      },
      {
        question: "What would change in your life if you truly believed God delights in hearing from you?",
        purpose: "Embrace God's heart for relationship"
      }
    ],

    actionSteps: [
      {
        step: "Establish a consistent daily prayer time, even if just 5 minutes to start",
        category: "Foundation",
        difficulty: "Beginner"
      },
      {
        step: "Choose a specific time and quiet place dedicated to prayer",
        category: "Environment",
        difficulty: "Beginner"
      },
      {
        step: "Practice the ACTS model for one full week, timing each section",
        category: "Structure",
        difficulty: "Intermediate"
      },
      {
        step: "Start a prayer journal to track requests, answers, and insights",
        category: "Growth",
        difficulty: "Intermediate"
      },
      {
        step: "Find a prayer partner for mutual encouragement and accountability",
        category: "Community",
        difficulty: "Advanced"
      },
      {
        step: "Memorize one key prayer verse this month",
        category: "Scripture",
        difficulty: "Intermediate"
      },
      {
        step: "Set up 'prayer reminders' throughout your day",
        category: "Lifestyle",
        difficulty: "Beginner"
      }
    ],

    practicalExercises: [
      {
        id: "gratitude-list",
        title: "7-Day Gratitude Challenge",
        description: "Write down 5 specific things you're grateful for each day",
        duration: "5 min daily"
      },
      {
        id: "acts-timer",
        title: "ACTS Prayer Timer",
        description: "Set a 5-minute timer for each part of ACTS prayer",
        duration: "20 min"
      },
      {
        id: "prayer-walk",
        title: "Prayer Walking",
        description: "Take a 15-minute walk while praying for your neighborhood",
        duration: "15 min"
      },
      {
        id: "scripture-prayer",
        title: "Praying Scripture",
        description: "Choose a psalm and pray it back to God in your own words",
        duration: "10 min"
      }
    ]
  };

  const markSectionComplete = (sectionIndex: number) => {
    if (!completedSections.includes(sectionIndex)) {
      setCompletedSections([...completedSections, sectionIndex]);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  const progressPercentage = (completedSections.length / studyData.sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={onBack} className="p-2 text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{studyData.title}</h1>
                <p className="text-xl text-orange-100 font-medium">{studyData.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {studyData.difficulty}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Clock className="h-3 w-3 mr-1" />
                  {studyData.estimatedTime}
                </Badge>
              </div>
            </div>

            {/* Study Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{studyData.verseCount}</div>
                <div className="text-sm text-orange-100">Bible Verses</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{studyData.sections.length}</div>
                <div className="text-sm text-orange-100">Study Sections</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{formatTime(studyTime)}</div>
                <div className="text-sm text-orange-100">Study Time</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-orange-100">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">Study Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {completedSections.length} of {studyData.sections.length} completed
                </span>
                <Button
                  variant={isStudying ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setIsStudying(!isStudying)}
                  className="flex items-center gap-2"
                >
                  {isStudying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isStudying ? "Pause" : "Start"} Study
                </Button>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - Takes 3 columns */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Enhanced Study Overview */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <BookOpen className="h-6 w-6" />
                  Study Overview
                </CardTitle>
              </div>
              <CardContent className="p-6 space-y-6">
                <p className="text-gray-700 leading-relaxed text-lg">{studyData.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {studyData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Key Verses */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <Star className="h-6 w-6" />
                  Key Verses & Insights
                </CardTitle>
              </div>
              <CardContent className="p-6 space-y-6">
                {studyData.keyVerses.map((verse, index) => (
                  <div key={index} className="relative p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Quote className="h-5 w-5 text-yellow-600" />
                      <span className="font-bold text-yellow-700 text-lg">{verse.reference}</span>
                    </div>
                    <blockquote className="text-gray-800 text-lg italic mb-4 leading-relaxed">
                      "{verse.text}"
                    </blockquote>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900 mb-1">Insight:</div>
                          <div className="text-gray-700">{verse.insight}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-900 mb-1">Practical Tip:</div>
                          <div className="text-blue-800">{verse.practicalTip}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Study Sections */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                <CardTitle className="text-white text-xl">Interactive Study Sections</CardTitle>
              </div>
              <CardContent className="p-6">
                <Tabs value={currentSection.toString()} onValueChange={(value) => setCurrentSection(parseInt(value))}>
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8 h-auto p-2">
                    {studyData.sections.map((section, index) => {
                      const IconComponent = section.icon;
                      return (
                        <TabsTrigger 
                          key={index} 
                          value={index.toString()}
                          className="flex flex-col items-center gap-2 p-4 text-xs h-auto"
                        >
                          <div className={`p-2 rounded-full bg-gradient-to-r ${section.color}`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-center leading-tight">{section.title}</span>
                          {completedSections.includes(index) && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {studyData.sections.map((section, index) => {
                    const IconComponent = section.icon;
                    return (
                      <TabsContent key={index} value={index.toString()} className="space-y-6">
                        <div className={`p-6 rounded-2xl bg-gradient-to-r ${section.color} text-white`}>
                          <div className="flex items-center gap-3 mb-3">
                            <IconComponent className="h-8 w-8" />
                            <div>
                              <h3 className="text-2xl font-bold">{section.title}</h3>
                              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mt-2">
                                <Clock className="h-3 w-3 mr-1" />
                                {section.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Overview */}
                          <div className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                              <Eye className="h-5 w-5 text-blue-500" />
                              Overview
                            </h4>
                            <p className="text-gray-700 leading-relaxed text-lg">{section.content.overview}</p>
                          </div>

                          {/* Key Points */}
                          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-blue-500" />
                              Key Learning Points
                            </h4>
                            <div className="grid gap-3">
                              {section.content.keyPoints.map((point, pointIndex) => (
                                <div key={pointIndex} className="flex items-start gap-3 p-4 bg-white/70 rounded-lg">
                                  <ChevronRight className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 leading-relaxed">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bible Examples */}
                          {section.content.bibleExamples && (
                            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-purple-500" />
                                Biblical Examples
                              </h4>
                              <div className="grid gap-4">
                                {section.content.bibleExamples.map((example, exampleIndex) => (
                                  <div key={exampleIndex} className="p-4 bg-white/70 rounded-lg border-l-4 border-purple-500">
                                    <div className="font-semibold text-purple-700 mb-1">
                                      {example.person} - {example.reference}
                                    </div>
                                    <div className="text-gray-700">{example.lesson}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Practical Application */}
                          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                            <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              Practical Application
                            </h4>
                            <p className="text-green-800 leading-relaxed text-lg">{section.content.practicalApplication}</p>
                          </div>

                          {/* Exercise */}
                          {section.content.exercise && (
                            <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                              <h4 className="font-bold text-orange-900 mb-3 text-lg flex items-center gap-2">
                                <PenTool className="h-5 w-5" />
                                This Week's Exercise
                              </h4>
                              <p className="text-orange-800 leading-relaxed text-lg">{section.content.exercise}</p>
                            </div>
                          )}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentSection(Math.max(0, index - 1))}
                            disabled={index === 0}
                            size="lg"
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous
                          </Button>

                          <Button
                            onClick={() => markSectionComplete(index)}
                            variant={completedSections.includes(index) ? "secondary" : "default"}
                            className="flex items-center gap-2"
                            size="lg"
                          >
                            {completedSections.includes(index) ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                Completed
                              </>
                            ) : (
                              <>
                                <Trophy className="h-5 w-5" />
                                Mark Complete
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => setCurrentSection(Math.min(studyData.sections.length - 1, index + 1))}
                            disabled={index === studyData.sections.length - 1}
                            size="lg"
                          >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Reflection Questions */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="h-5 w-5" />
                  Reflection Questions
                </CardTitle>
              </div>
              <CardContent className="p-4 space-y-3">
                {studyData.reflectionQuestions.map((item, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-900 font-medium mb-2">{item.question}</p>
                    <p className="text-xs text-purple-600 italic">{item.purpose}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Steps */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5" />
                  Action Steps
                </CardTitle>
              </div>
              <CardContent className="p-4 space-y-3">
                {studyData.actionSteps.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 mb-1">{item.step}</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{item.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Practical Exercises */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5" />
                  Practical Exercises
                </CardTitle>
              </div>
              <CardContent className="p-4 space-y-3">
                {studyData.practicalExercises.map((exercise) => (
                  <div key={exercise.id} className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-orange-900 text-sm">{exercise.title}</h5>
                      <Button
                        variant={completedExercises.includes(exercise.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleExercise(exercise.id)}
                        className="h-6 w-6 p-0"
                      >
                        {completedExercises.includes(exercise.id) ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          "+"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-orange-800 mb-2">{exercise.description}</p>
                    <Badge variant="outline" className="text-xs">{exercise.duration}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Tools */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4">
                <CardTitle className="text-white">Study Tools</CardTitle>
              </div>
              <CardContent className="p-4 space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Share Study
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Print Study Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}; 