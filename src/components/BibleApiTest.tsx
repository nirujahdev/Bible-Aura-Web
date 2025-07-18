import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { BIBLE_TRANSLATIONS } from '@/lib/bible-api';

interface ApiTestResult {
  translationId: string;
  translationName: string;
  language: string;
  status: 'testing' | 'success' | 'error';
  message?: string;
  responseTime?: number;
}

export function BibleApiTest() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const testTranslation = async (translation: typeof BIBLE_TRANSLATIONS[0]): Promise<ApiTestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://api.bible.berinaniesh.xyz/books?translation=${translation.apiId}`);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No books returned from API');
      }

      return {
        translationId: translation.id,
        translationName: translation.name,
        language: translation.language,
        status: 'success',
        message: `✓ ${data.length} books loaded`,
        responseTime
      };
    } catch (error) {
      return {
        translationId: translation.id,
        translationName: translation.name,
        language: translation.language,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime
      };
    }
  };

  const runTests = async () => {
    // Test key translations: English (KJV), Tamil, and Sinhala
    const testTranslations = BIBLE_TRANSLATIONS.filter(t => 
      ['kjv', 'tamil-ov', 'sinhala'].includes(t.id)
    );

    // Initialize results
    const initialResults = testTranslations.map(t => ({
      translationId: t.id,
      translationName: t.name,
      language: t.language,
      status: 'testing' as const
    }));
    
    setResults(initialResults);
    setIsVisible(true);

    // Test each translation
    for (const translation of testTranslations) {
      const result = await testTranslation(translation);
      
      setResults(prev => prev.map(r => 
        r.translationId === translation.id ? result : r
      ));
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Bible API Test
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-blue-700 text-sm flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Bible API Test Results
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={runTests}
              className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {results.map((result, index) => (
              <Alert key={index} className="border-blue-200 bg-white">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {result.status === 'testing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      
                      <div>
                        <div className="font-medium text-sm">
                          {result.translationName}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.language}
                        </Badge>
                      </div>
                    </div>
                    
                    {result.responseTime && (
                      <Badge variant="secondary" className="text-xs">
                        {result.responseTime}ms
                      </Badge>
                    )}
                  </div>
                  
                  {result.message && (
                    <div className={`text-xs mt-2 ${
                      result.status === 'error' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {result.message}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-blue-600">
            Tests: English (KJV), Tamil, Sinhala Bible loading
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 