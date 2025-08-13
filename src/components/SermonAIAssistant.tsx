import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, Bot, Target, Users, BookOpen, 
  CheckCircle, RefreshCw, Wand2, Brain
} from 'lucide-react';

interface SermonOutline {
  title: string;
  theme: string;
  mainPoints: Array<{title: string, subpoints: string[]}>;
  introduction: string;
  conclusion: string;
  scriptureReferences: string[];
  applications: string[];
}

interface SermonAIAssistantProps {
  currentContent: string;
  onContentUpdate: (content: string) => void;
  onOutlineGenerated: (outline: SermonOutline) => void;
  sermonTitle: string;
  scriptureReference: string;
}

const SermonAIAssistant: React.FC<SermonAIAssistantProps> = ({
  currentContent,
  onContentUpdate,
  onOutlineGenerated,
  sermonTitle,
  scriptureReference
}) => {
  const { toast } = useToast();
  
  // States
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('general');
  const [sermonType, setSermonType] = useState('expository');
  const [tone, setTone] = useState('inspiring');
  const [generatedOutline, setGeneratedOutline] = useState<SermonOutline | null>(null);

  // DeepSeek API call for sermon assistant
  const callDeepSeekAPI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.VITE_AI_API_KEY;
    
    if (!apiKey || apiKey === 'demo-key' || apiKey === 'your_deepseek_api_key_here') {
      throw new Error('🔑 DeepSeek API key not configured! Please check your environment variables.');
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sermon writing assistant. Help pastors create biblically sound, engaging sermons with practical applications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Generate sermon outline
  const generateSermonOutline = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a sermon topic or scripture reference",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a detailed sermon outline for:

Topic: ${topic}
Scripture: ${scriptureReference || 'Please suggest relevant scripture'}
Target Audience: ${audience}
Sermon Type: ${sermonType}
Tone: ${tone}

Please provide:
1. A compelling sermon title
2. Central message (one sentence)
3. 3-4 main points with sub-points
4. Engaging introduction hook
5. Strong conclusion with call to action
6. Practical applications for each point
7. Suggested scripture references

Make it practical, engaging, and biblically sound for a ${audience} audience.`;

      const response = await callDeepSeekAPI(prompt);
      
      // Parse the AI response into a structured outline
      const outline: SermonOutline = parseOutlineResponse(response, topic, scriptureReference);

      setGeneratedOutline(outline);
      onOutlineGenerated(outline);

      toast({
        title: "✨ Sermon Outline Generated!",
        description: `Created ${sermonType} outline for ${audience} audience`,
      });

    } catch (error) {
      console.error('Error generating sermon:', error);
      toast({
        title: "Generation Failed", 
        description: error instanceof Error ? error.message : "Failed to generate outline. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse AI response into structured outline
  const parseOutlineResponse = (response: string, topicParam: string, scripture?: string): SermonOutline => {
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      title: extractTitle(lines, topicParam),
      theme: extractTheme(lines, topicParam),
      mainPoints: extractMainPoints(lines),
      introduction: extractSection(lines, 'introduction') || generateDefaultIntroduction(topicParam),
      conclusion: extractSection(lines, 'conclusion') || generateDefaultConclusion(topicParam),
      applications: extractApplications(lines),
      scriptureReferences: extractScriptureReferences(lines, scripture)
    };
  };

  // Helper functions for parsing AI response
  const extractTitle = (lines: string[], topicParam: string): string => {
    for (const line of lines) {
      if (line.toLowerCase().includes('title:') || line.toLowerCase().includes('sermon title:')) {
        return line.replace(/.*title:\s*/i, '').trim();
      }
    }
    return `Understanding ${topicParam}: A Biblical Perspective`;
  };

  const extractTheme = (lines: string[], topicParam: string): string => {
    for (const line of lines) {
      if (line.toLowerCase().includes('theme:') || line.toLowerCase().includes('central message:')) {
        return line.replace(/.*(?:theme|central message):\s*/i, '').trim();
      }
    }
    return `Exploring the biblical foundation and practical application of ${topicParam} for everyday life`;
  };

  const extractMainPoints = (lines: string[]): Array<{title: string, subpoints: string[]}> => {
    const points: Array<{title: string, subpoints: string[]}> = [];
    let currentPoint: {title: string, subpoints: string[]} | null = null;
    let inPointsSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('main points') || line.toLowerCase().includes('outline:')) {
        inPointsSection = true;
        continue;
      }

      if (inPointsSection && line.match(/^\d+\./)) {
        if (currentPoint) points.push(currentPoint);
        currentPoint = {
          title: line.replace(/^\d+\.\s*/, '').trim(),
          subpoints: []
        };
      } else if (inPointsSection && line.match(/^\s*-/) && currentPoint) {
        currentPoint.subpoints.push(line.replace(/^\s*-\s*/, '').trim());
      } else if (inPointsSection && currentPoint && !line.match(/^\d+\./)) {
        // End of points section
        points.push(currentPoint);
        break;
      }
    }

    if (currentPoint) points.push(currentPoint);

    // Default points if none extracted
    if (points.length === 0) {
      return [
        { title: 'Biblical Foundation', subpoints: ['Historical context', 'Original meaning', 'Theological significance'] },
        { title: 'Personal Application', subpoints: ['Daily life impact', 'Practical steps', 'Common challenges'] },
        { title: 'Community Living', subpoints: ['Relationships', 'Church involvement', 'Witness to others'] }
      ];
    }

    return points;
  };

  const extractSection = (lines: string[], sectionName: string): string | null => {
    let inSection = false;
    let sectionContent = '';

    for (const line of lines) {
      if (line.toLowerCase().includes(`${sectionName}:`)) {
        inSection = true;
        sectionContent = line.replace(new RegExp(`.*${sectionName}:\\s*`, 'i'), '').trim();
        continue;
      }

      if (inSection && line.match(/^[A-Z][a-z]+:/)) {
        // New section started
        break;
      }

      if (inSection) {
        sectionContent += ' ' + line.trim();
      }
    }

    return sectionContent.trim() || null;
  };

  const extractApplications = (lines: string[]): string[] => {
    const applications: string[] = [];
    let inApplicationsSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('application') || line.toLowerCase().includes('action steps')) {
        inApplicationsSection = true;
        continue;
      }

      if (inApplicationsSection && (line.match(/^\s*-/) || line.match(/^\d+\./))) {
        applications.push(line.replace(/^\s*[-\d.]\s*/, '').trim());
      } else if (inApplicationsSection && applications.length > 0 && !line.match(/^\s*[-\d.]/)) {
        // End of applications section
        break;
      }
    }

    // Default applications if none found
    if (applications.length === 0) {
      return [
        'Spend time in prayer asking God for wisdom',
        'Study additional scripture passages on this topic',
        'Share insights with family or small group',
        'Look for practical ways to apply this week'
      ];
    }

    return applications;
  };

  const extractScriptureReferences = (lines: string[], defaultScripture?: string): string[] => {
    const references: string[] = [];
    let inReferencesSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes('scripture') || line.toLowerCase().includes('references') || line.toLowerCase().includes('verses')) {
        inReferencesSection = true;
        continue;
      }

      if (inReferencesSection && (line.match(/^\s*-/) || line.match(/\d+:\d+/))) {
        references.push(line.replace(/^\s*-\s*/, '').trim());
      } else if (inReferencesSection && references.length > 0 && !line.match(/^\s*-/)) {
        break;
      }
    }

    // Default references if none found
    if (references.length === 0) {
      return [
        defaultScripture || 'Romans 12:1-2',
        '2 Timothy 3:16-17',
        'Philippians 4:13'
      ];
    }

    return references;
  };

  const generateDefaultIntroduction = (topicParam: string): string => {
    return `Have you ever wondered what it truly means to experience ${topicParam.toLowerCase()} in your daily walk with God? Today we'll explore how Scripture provides practical guidance for this important aspect of our faith journey.`;
  };

  const generateDefaultConclusion = (topicParam: string): string => {
    return `As we've seen today, ${topicParam.toLowerCase()} isn't just a theological concept—it's a living reality that God wants to work in and through each of us. Let's commit to taking these truths and making them practical in our everyday lives.`;
  };

  return (
    <div className="sermon-ai-assistant-container p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          ✦ Sermon AI Assistant
        </h2>
        <p className="text-gray-600 mt-2">Generate comprehensive sermon outlines using AI</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Topic/Scripture</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter sermon topic or scripture reference"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="youth">Youth</option>
              <option value="adults">Adults</option>
              <option value="seniors">Seniors</option>
              <option value="families">Families</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Sermon Type</label>
            <select
              value={sermonType}
              onChange={(e) => setSermonType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="expository">Expository</option>
              <option value="topical">Topical</option>
              <option value="narrative">Narrative</option>
              <option value="biographical">Biographical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inspiring">Inspiring</option>
              <option value="challenging">Challenging</option>
              <option value="comforting">Comforting</option>
              <option value="teaching">Teaching</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateSermonOutline}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Generating AI Outline...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Sermon Outline
            </>
          )}
        </button>

        {generatedOutline && (
          <div className="mt-6 p-6 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">{generatedOutline.title}</h3>
            </div>
            <p className="text-gray-700 mb-6 p-3 bg-white rounded-lg border-l-4 border-blue-500">{generatedOutline.theme}</p>
            
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Main Points:
                </h4>
                <ul className="space-y-3">
                  {generatedOutline.mainPoints.map((point, index) => (
                    <li key={index} className="border-l-4 border-blue-200 pl-4 bg-blue-50 p-3 rounded-r-lg">
                      <div className="font-medium text-gray-800 mb-2">{index + 1}. {point.title}</div>
                      <ul className="ml-4 space-y-1">
                        {point.subpoints.map((subpoint, subIndex) => (
                          <li key={subIndex} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            {subpoint}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-green-600" />
                    Introduction:
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{generatedOutline.introduction}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    Conclusion:
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{generatedOutline.conclusion}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  Practical Applications:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {generatedOutline.applications.map((app, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2 p-2 bg-orange-50 rounded">
                      <span className="text-orange-500 mt-1">✓</span>
                      {app}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Scripture References:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {generatedOutline.scriptureReferences.map((ref, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full font-medium">
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SermonAIAssistant; 