import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Heart, Star, Clock, Users, 
  ChevronRight, Play, Pause, CheckCircle,
  MessageCircle, Lightbulb, Target, ArrowLeft
} from 'lucide-react';

interface PrayerStudyProps {
  onBack: () => void;
}

export const PrayerStudy: React.FC<PrayerStudyProps> = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const studyData = {
    title: "Prayer & Intercession",
    subtitle: "Spiritual Disciplines",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    verseCount: 127,
    tags: ['prayer', 'worship', 'intercession', 'spiritual-discipline'],
    description: "Discover the power of prayer through biblical examples, different prayer types, and practical applications for daily spiritual growth.",
    
    keyVerses: [
      {
        reference: "Matthew 6:9-13",
        text: "Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven...",
        insight: "Jesus teaches us the model prayer, showing the proper order: God's glory first, then our needs."
      },
      {
        reference: "1 Thessalonians 5:17",
        text: "Pray continually.",
        insight: "Paul encourages us to maintain an attitude of prayer throughout our day."
      },
      {
        reference: "James 5:16",
        text: "The prayer of a righteous person is powerful and effective.",
        insight: "Our prayers have real power when we align our hearts with God's righteousness."
      }
    ],

    sections: [
      {
        title: "Introduction to Prayer",
        duration: "8 min",
        content: {
          overview: "Prayer is our direct communication line with God. It's not just asking for things, but building a relationship with our Heavenly Father.",
          keyPoints: [
            "Prayer is conversation with God, not a monologue",
            "God desires to hear from His children at all times",
            "Prayer changes us as much as our circumstances"
          ],
          practicalApplication: "Start each day with 5 minutes of simple conversation with God, sharing your heart like you would with a close friend."
        }
      },
      {
        title: "Types of Prayer",
        duration: "12 min",
        content: {
          overview: "The Bible reveals different types of prayer, each serving a unique purpose in our spiritual growth and relationship with God.",
          keyPoints: [
            "Adoration: Praising God for who He is",
            "Confession: Acknowledging our sins and seeking forgiveness",
            "Thanksgiving: Expressing gratitude for God's blessings",
            "Supplication: Making requests for ourselves and others"
          ],
          practicalApplication: "Use the ACTS model (Adoration, Confession, Thanksgiving, Supplication) to structure your daily prayer time."
        }
      },
      {
        title: "Biblical Examples",
        duration: "15 min",
        content: {
          overview: "Learn from the prayer lives of biblical heroes who had powerful relationships with God through prayer.",
          keyPoints: [
            "Daniel: Consistent daily prayer despite persecution",
            "Nehemiah: Quick prayers in moments of need",
            "Jesus: Regular withdrawal for prayer and communion with the Father",
            "Paul: Constant prayer for the churches and believers"
          ],
          practicalApplication: "Choose one biblical prayer hero and study their prayer habits. Implement one of their practices this week."
        }
      },
      {
        title: "Overcoming Prayer Obstacles",
        duration: "10 min",
        content: {
          overview: "Common challenges in prayer and biblical solutions to overcome them.",
          keyPoints: [
            "Distraction: Create a dedicated prayer space and time",
            "Doubt: Remember God's faithfulness in the past",
            "Unanswered prayer: Trust in God's perfect timing and wisdom",
            "Busyness: Start with just 2-3 minutes and gradually increase"
          ],
          practicalApplication: "Identify your biggest prayer obstacle and implement one specific strategy to overcome it this week."
        }
      }
    ],

    reflectionQuestions: [
      "What aspects of prayer do you find most challenging?",
      "How has your understanding of prayer changed through this study?",
      "Which type of prayer (ACTS) do you tend to neglect most?",
      "What practical changes will you make to your prayer life this week?"
    ],

    actionSteps: [
      "Commit to a daily prayer time, even if just 5 minutes",
      "Choose a consistent time and place for prayer",
      "Practice the ACTS model for one week",
      "Start a prayer journal to track requests and answers",
      "Find a prayer partner for mutual encouragement and accountability"
    ]
  };

  const markSectionComplete = (sectionIndex: number) => {
    if (!completedSections.includes(sectionIndex)) {
      setCompletedSections([...completedSections, sectionIndex]);
    }
  };

  const progressPercentage = (completedSections.length / studyData.sections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{studyData.title}</h1>
          <p className="text-lg text-orange-600 font-medium">{studyData.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{studyData.difficulty}</Badge>
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {studyData.estimatedTime}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Study Progress</span>
            <span className="text-sm text-gray-500">
              {completedSections.length} of {studyData.sections.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Study Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                Study Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{studyData.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {studyData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{studyData.verseCount}</div>
                  <div className="text-sm text-gray-600">Bible Verses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{studyData.sections.length}</div>
                  <div className="text-sm text-gray-600">Study Sections</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Verses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Key Verses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyData.keyVerses.map((verse, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="font-semibold text-orange-600 text-sm mb-1">
                    {verse.reference}
                  </div>
                  <blockquote className="text-gray-700 italic mb-2">
                    "{verse.text}"
                  </blockquote>
                  <div className="text-sm text-gray-600 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {verse.insight}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Study Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Study Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentSection.toString()} onValueChange={(value) => setCurrentSection(parseInt(value))}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                  {studyData.sections.map((section, index) => (
                    <TabsTrigger 
                      key={index} 
                      value={index.toString()}
                      className="text-xs flex items-center gap-1"
                    >
                      {completedSections.includes(index) && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      Section {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {studyData.sections.map((section, index) => (
                  <TabsContent key={index} value={index.toString()} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {section.duration}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Overview</h4>
                        <p className="text-gray-700 leading-relaxed">{section.content.overview}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                        <ul className="space-y-2">
                          {section.content.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2 text-gray-700">
                              <ChevronRight className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Practical Application
                        </h4>
                        <p className="text-blue-800">{section.content.practicalApplication}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection(Math.max(0, index - 1))}
                        disabled={index === 0}
                      >
                        Previous
                      </Button>

                      <Button
                        onClick={() => markSectionComplete(index)}
                        variant={completedSections.includes(index) ? "secondary" : "default"}
                        className="flex items-center gap-2"
                      >
                        {completedSections.includes(index) ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          "Mark Complete"
                        )}
                      </Button>

                      <Button
                        onClick={() => setCurrentSection(Math.min(studyData.sections.length - 1, index + 1))}
                        disabled={index === studyData.sections.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reflection Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-500" />
                Reflection Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studyData.reflectionQuestions.map((question, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">{question}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Action Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studyData.actionSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 p-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Study Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Study Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Add to Favorites
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Share Study
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 