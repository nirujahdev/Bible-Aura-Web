import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Star, Clock, Users, 
  ChevronRight, CheckCircle, MapPin,
  MessageCircle, Lightbulb, Target, ArrowLeft, Book
} from 'lucide-react';

interface GoodSamaritanStudyProps {
  onBack: () => void;
}

export const GoodSamaritanStudy: React.FC<GoodSamaritanStudyProps> = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const studyData = {
    title: "The Good Samaritan",
    theme: "Love & Compassion",
    reference: "Luke 10:25-37",
    difficulty: 2,
    estimatedTime: "35 min",
    context: "Teaching about neighborly love",
    
    fullText: `25 On one occasion an expert in the law stood up to test Jesus. "Teacher," he said, "what must I do to inherit eternal life?" 26 "What is written in the Law?" he replied. "How do you read it?" 27 He answered, "'Love the Lord your God with all your heart and with all your soul and with all your strength and with all your mind'; and, 'Love your neighbor as yourself.'" 28 "You have answered correctly," Jesus replied. "Do this and you will live." 29 But he wanted to justify himself, so he asked Jesus, "And who is my neighbor?" 30 In reply Jesus said: "A man was going down from Jerusalem to Jericho, when he was attacked by robbers. They stripped him of his clothes, beat him and went away, leaving him half dead. 31 A priest happened to be going down the same road, and when he saw the man, he passed by on the other side. 32 So too, a Levite, when he came to the place and saw him, passed by on the other side. 33 But a Samaritan, as he traveled, came where the man was; and when he saw him, he took pity on him. 34 He went to him and bandaged his wounds, pouring on oil and wine. Then he put the man on his own donkey, brought him to an inn and took care of him. 35 The next day he took out two denarii and gave them to the innkeeper. 'Look after him,' he said, 'and when I return, I will reimburse you for any extra expense you incur.' 36 "Which of these three do you think was a neighbor to the man who fell into the hands of robbers?" 37 The expert in the law replied, "The one who had mercy on him." Jesus told him, "Go and do likewise."`,

    historicalContext: {
      background: "The road from Jerusalem to Jericho was notorious for robbery and violence. It descended 3,300 feet over 17 miles through desert terrain with many hiding places for bandits.",
      culturalTension: "Jews and Samaritans had centuries of ethnic and religious hatred. Samaritans were considered 'half-breeds' and religious apostates by Jewish society.",
      religiousLeaders: "Priests and Levites were the religious elite, expected to be examples of righteousness and compassion. Their avoidance would have shocked Jesus' audience.",
      socialImpact: "For Jesus to make a despised Samaritan the hero of the story was revolutionary and deeply challenging to Jewish prejudices."
    },

    sections: [
      {
        title: "The Setup",
        duration: "8 min",
        content: {
          focus: "Understanding the lawyer's question and Jesus' response strategy",
          keyPoints: [
            "The lawyer's test: 'What must I do to inherit eternal life?'",
            "Jesus redirects to the law: 'Love God and neighbor'",
            "The follow-up question: 'Who is my neighbor?' reveals the heart issue",
            "Jesus answers with a story instead of a definition"
          ],
          insight: "Jesus doesn't just answer the question - He transforms it. Instead of defining 'neighbor,' He shows what it means to be neighborly.",
          application: "When we ask God questions, we should be prepared for answers that challenge our assumptions and call us to action."
        }
      },
      {
        title: "The Crime",
        duration: "6 min", 
        content: {
          focus: "The victim's desperate situation and vulnerability",
          keyPoints: [
            "The dangerous Jericho road - known for robberies",
            "Complete helplessness: stripped, beaten, half-dead",
            "No identification, money, or means of communication",
            "Time-sensitive need for immediate help"
          ],
          insight: "The victim represents all of us in our spiritual condition - helpless, vulnerable, and in desperate need of rescue.",
          application: "Look for people around you who are 'stripped and beaten' by life circumstances and need compassion."
        }
      },
      {
        title: "The Failures",
        duration: "10 min",
        content: {
          focus: "Why the priest and Levite failed to help",
          keyPoints: [
            "The priest 'passed by on the other side' - deliberate avoidance",
            "The Levite did the same - religious position didn't guarantee compassion",
            "Possible excuses: ritual purity, personal safety, inconvenience",
            "Both saw the need but chose not to act"
          ],
          insight: "Religious knowledge and position don't automatically produce compassionate action. The heart must be transformed.",
          application: "Examine your own excuses for not helping others. Don't let religious activity substitute for loving action."
        }
      },
      {
        title: "The Hero",
        duration: "11 min",
        content: {
          focus: "The Samaritan's radical compassion in action",
          keyPoints: [
            "'He took pity' - compassion moved him to action",
            "Personal involvement: bandaged wounds, used own supplies",
            "Financial sacrifice: paid for care and promised more",
            "Ongoing commitment: 'when I return, I will reimburse you'",
            "No questions about the victim's identity or worthiness"
          ],
          insight: "True neighborly love is costly, inconvenient, and crosses all social boundaries. It's measured by sacrifice, not sentiment.",
          application: "Look for specific, costly ways to help others. True love involves our time, resources, and ongoing commitment."
        }
      }
    ],

    keyLessons: [
      {
        lesson: "Love Crosses All Boundaries",
        explanation: "The Samaritan helped despite ethnic and religious differences",
        modernExample: "Helping someone regardless of their race, religion, political views, or social status"
      },
      {
        lesson: "Compassion Requires Action",
        explanation: "Seeing the need isn't enough - love must be expressed through deeds",
        modernExample: "Moving beyond feeling sorry for someone to actually doing something to help"
      },
      {
        lesson: "True Religion is Practical",
        explanation: "Religious knowledge without compassionate action is empty",
        modernExample: "Church attendance and Bible knowledge mean nothing without loving our neighbors"
      },
      {
        lesson: "Love is Costly",
        explanation: "The Samaritan sacrificed time, money, and convenience",
        modernExample: "Real love involves personal sacrifice and ongoing commitment"
      }
    ],

    practicalSteps: [
      {
        step: "Identify Your 'Samaritans'",
        description: "Who are the people you naturally avoid or look down on?",
        action: "Pray for God to give you His heart for these people"
      },
      {
        step: "Look for 'Beaten' People",
        description: "Notice those around you who are hurting or in need",
        action: "Ask God to open your eyes to needs you normally overlook"
      },
      {
        step: "Take the First Step",
        description: "Don't wait for someone else to help - be the Good Samaritan",
        action: "Choose one specific way to help someone this week"
      },
      {
        step: "Make a Commitment",
        description: "Like the Samaritan, follow through on your help",
        action: "Don't just offer one-time help, but ongoing support when needed"
      }
    ],

    reflectionQuestions: [
      "Who are the 'Samaritans' in your life - people you struggle to love?",
      "What 'beaten and robbed' people has God placed in your path?",
      "What excuses do you make for not helping others (like the priest and Levite)?",
      "How can you show costly, sacrificial love to someone this week?",
      "In what ways have you been like the victim - rescued by unexpected grace?"
    ],

    modernApplications: [
      {
        scenario: "Homeless Person on the Street",
        goodSamaritan: "Stop, offer food/money, connect them with local services, follow up",
        priestLevite: "Walk by, avoid eye contact, judge their situation, make excuses"
      },
      {
        scenario: "Difficult Coworker in Trouble",
        goodSamaritan: "Offer practical help, set aside personal differences, show genuine care",
        priestLevite: "Think 'they deserve it,' avoid involvement, gossip about their problems"
      },
      {
        scenario: "Neighbor of Different Background",
        goodSamaritan: "Build relationships, offer assistance, include them in community",
        priestLevite: "Keep distance, make assumptions, only associate with 'our kind'"
      }
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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-3xl shadow-lg">
            🤝
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{studyData.title}</h1>
            <p className="text-lg text-green-600 font-medium">{studyData.theme}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>{studyData.reference}</span>
              <span>•</span>
              <Badge variant="outline">Level {studyData.difficulty}</Badge>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {studyData.estimatedTime}
              </span>
            </div>
          </div>
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
          
          {/* Parable Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-green-500" />
                The Parable Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-800 mb-2">{studyData.reference}</p>
                <div className="text-green-900 leading-relaxed text-sm space-y-2">
                  {studyData.fullText.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Historical Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">The Jericho Road</h4>
                    <p className="text-sm text-gray-700">{studyData.historicalContext.background}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Religious Leaders</h4>
                    <p className="text-sm text-gray-700">{studyData.historicalContext.religiousLeaders}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cultural Tension</h4>
                    <p className="text-sm text-gray-700">{studyData.historicalContext.culturalTension}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Social Impact</h4>
                    <p className="text-sm text-gray-700">{studyData.historicalContext.socialImpact}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Study</CardTitle>
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
                      {section.title}
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
                        <h4 className="font-medium text-gray-900 mb-2">Focus</h4>
                        <p className="text-gray-700 leading-relaxed">{section.content.focus}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                        <ul className="space-y-2">
                          {section.content.keyPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="flex items-start gap-2 text-gray-700">
                              <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Key Insight
                        </h4>
                        <p className="text-yellow-800">{section.content.insight}</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Modern Application
                        </h4>
                        <p className="text-blue-800">{section.content.application}</p>
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

          {/* Key Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Key Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyData.keyLessons.map((lesson, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{lesson.lesson}</h4>
                  <p className="text-gray-700 text-sm mb-2">{lesson.explanation}</p>
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <p className="text-green-800 text-sm"><strong>Today:</strong> {lesson.modernExample}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Modern Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Modern Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyData.modernApplications.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{scenario.scenario}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                      <h5 className="font-medium text-green-800 mb-1">Good Samaritan Response:</h5>
                      <p className="text-green-700 text-sm">{scenario.goodSamaritan}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                      <h5 className="font-medium text-red-800 mb-1">Priest/Levite Response:</h5>
                      <p className="text-red-700 text-sm">{scenario.priestLevite}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reflection Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                Reflection Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studyData.reflectionQuestions.map((question, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">{question}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Practical Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Practical Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studyData.practicalSteps.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 text-sm mb-1">{item.step}</h5>
                  <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-blue-800 font-medium">{item.action}</p>
                  </div>
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
                <MapPin className="h-4 w-4 mr-2" />
                View Map
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 