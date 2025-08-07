import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, Heart, Star, Clock, Users, 
  ChevronRight, CheckCircle, Cross,
  MessageCircle, Lightbulb, Target, ArrowLeft
} from 'lucide-react';

interface JesusStudyProps {
  onBack: () => void;
}

export const JesusStudy: React.FC<JesusStudyProps> = ({ onBack }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const studyData = {
    name: "Jesus Christ",
    role: "Savior & Lord",
    testament: "New Testament",
    timeframe: "4 BC - 30 AD (Earthly ministry)",
    description: "The Son of God, Savior of the world, who came to earth to redeem humanity through His perfect life, sacrificial death, and victorious resurrection.",
    
    keyVerses: [
      {
        reference: "John 3:16",
        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        insight: "This verse encapsulates the heart of the Gospel - God's love expressed through Jesus."
      },
      {
        reference: "John 14:6",
        text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
        insight: "Jesus declares His exclusive role as the path to God and eternal life."
      },
      {
        reference: "Philippians 2:6-8",
        text: "Who, being in very nature God, did not consider equality with God something to be used to his own advantage; rather, he made himself nothing by taking the very nature of a servant...",
        insight: "The incarnation - God became man to serve and save humanity."
      }
    ],

    characterTraits: [
      { trait: "Perfect Love", description: "Demonstrated unconditional love for all people" },
      { trait: "Compassion", description: "Moved by the suffering and needs of others" },
      { trait: "Wisdom", description: "Spoke with divine wisdom and authority" },
      { trait: "Humility", description: "Though God, He served others with humility" },
      { trait: "Obedience", description: "Perfectly obedient to the Father's will" },
      { trait: "Forgiveness", description: "Offered forgiveness even to His enemies" }
    ],

    sections: [
      {
        title: "The Incarnation",
        duration: "12 min",
        content: {
          overview: "The miracle of God becoming man - the Word became flesh and dwelt among us.",
          keyEvents: [
            "Prophetic promises throughout the Old Testament",
            "Virgin birth announced by angel Gabriel",
            "Born in Bethlehem as prophesied",
            "Recognized by shepherds and wise men"
          ],
          significance: "Jesus' incarnation bridges the gap between holy God and sinful humanity. He is fully God and fully man, uniquely qualified to be our mediator.",
          modernApplication: "Jesus understands our human experience because He lived it perfectly. We can bring any struggle to Him knowing He relates to us completely."
        }
      },
      {
        title: "Ministry & Teaching",
        duration: "15 min",
        content: {
          overview: "Jesus' three-year public ministry revolutionized understanding of God and His kingdom.",
          keyEvents: [
            "Baptism and anointing by the Holy Spirit",
            "Calling of the twelve disciples",
            "Sermon on the Mount - Kingdom principles",
            "Parables teaching heavenly truths",
            "Miracles demonstrating divine power"
          ],
          significance: "Jesus' ministry revealed God's heart for the lost, broken, and marginalized. His teachings established the principles of God's kingdom.",
          modernApplication: "Jesus' ministry model shows us how to serve others with love, teach truth with grace, and demonstrate God's power through our lives."
        }
      },
      {
        title: "The Cross",
        duration: "18 min",
        content: {
          overview: "The climax of Jesus' earthly mission - bearing the sins of the world on the cross.",
          keyEvents: [
            "Last Supper - establishing the New Covenant",
            "Garden of Gethsemane - perfect submission to God's will",
            "Betrayal and arrest",
            "Crucifixion - the ultimate sacrifice for sin",
            "Death and burial"
          ],
          significance: "The cross is where justice and mercy meet. Jesus paid the penalty for our sins, making forgiveness and reconciliation with God possible.",
          modernApplication: "The cross calls us to die to self and live for Christ. It's the basis of our forgiveness and the model for sacrificial love."
        }
      },
      {
        title: "The Resurrection",
        duration: "10 min",
        content: {
          overview: "Jesus' resurrection validates His claims and secures our eternal hope.",
          keyEvents: [
            "Empty tomb discovered on the third day",
            "Appearances to Mary Magdalene and disciples",
            "Great Commission given to the church",
            "Ascension to heaven",
            "Promise of His return"
          ],
          significance: "The resurrection proves Jesus' victory over sin and death. It's the foundation of Christian faith and our hope of eternal life.",
          modernApplication: "Because Jesus lives, we have hope beyond this life. His resurrection power is available to transform our lives today."
        }
      }
    ],

    lifeLessons: [
      {
        lesson: "Perfect Love in Action",
        description: "Jesus demonstrated that true love is sacrificial and seeks the good of others above self.",
        application: "Love others unconditionally, even when it costs us personally."
      },
      {
        lesson: "Servant Leadership",
        description: "Though He was Lord, Jesus came to serve, not to be served.",
        application: "True greatness is found in serving others, especially those who cannot repay us."
      },
      {
        lesson: "Forgiveness Without Limits",
        description: "Jesus forgave His enemies even while dying on the cross.",
        application: "Extend forgiveness to those who hurt us, knowing we've been forgiven much."
      },
      {
        lesson: "Obedience to God's Will",
        description: "Jesus perfectly submitted to the Father's plan, even unto death.",
        application: "Trust and obey God's plan for our lives, even when it's difficult to understand."
      }
    ],

    reflectionQuestions: [
      "How does Jesus' example of sacrificial love challenge your relationships?",
      "What aspect of Jesus' character do you most want to develop in your own life?",
      "How does the reality of Jesus' resurrection impact your daily decisions?",
      "In what ways can you follow Jesus' example of servant leadership?"
    ],

    actionSteps: [
      "Spend daily time in prayer and Bible reading to know Jesus better",
      "Practice sacrificial love by putting others' needs before your own",
      "Look for opportunities to serve others without expecting recognition",
      "Share the hope of Jesus with someone who doesn't know Him",
      "Study the Gospels to understand Jesus' teachings more deeply"
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
            ✝️
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{studyData.name}</h1>
            <p className="text-lg text-purple-600 font-medium">{studyData.role}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>{studyData.testament}</span>
              <span>•</span>
              <span>{studyData.timeframe}</span>
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
          
          {/* Character Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Character Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{studyData.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {studyData.characterTraits.map((trait, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-800 text-sm">{trait.trait}</div>
                    <div className="text-xs text-purple-600 mt-1">{trait.description}</div>
                  </div>
                ))}
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
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="font-semibold text-purple-600 text-sm mb-1">
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
              <CardTitle>Life & Ministry Study</CardTitle>
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
                        <h4 className="font-medium text-gray-900 mb-2">Overview</h4>
                        <p className="text-gray-700 leading-relaxed">{section.content.overview}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Events</h4>
                        <ul className="space-y-2">
                          {section.content.keyEvents.map((event, eventIndex) => (
                            <li key={eventIndex} className="flex items-start gap-2 text-gray-700">
                              <ChevronRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Significance</h4>
                        <p className="text-purple-800">{section.content.significance}</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Modern Application
                        </h4>
                        <p className="text-blue-800">{section.content.modernApplication}</p>
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

          {/* Life Lessons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Life Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studyData.lifeLessons.map((lesson, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{lesson.lesson}</h4>
                  <p className="text-gray-700 text-sm mb-2">{lesson.description}</p>
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                    <p className="text-green-800 text-sm font-medium">Application: {lesson.application}</p>
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
                <Cross className="h-4 w-4 mr-2" />
                Compare Gospels
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 