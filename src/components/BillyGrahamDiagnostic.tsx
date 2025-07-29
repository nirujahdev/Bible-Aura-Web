import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Database
} from 'lucide-react';
import { readJsonFromStorage } from '@/lib/supabase-storage';
import { billyGrahamDevotional } from '@/lib/billy-graham-devotional';

interface DiagnosticResult {
  success: boolean;
  message: string;
  data?: any;
}

export function BillyGrahamDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    
    const diagnostics: DiagnosticResult[] = [];

    try {
      // Test 1: Check if JSON file exists and can be read
      const rawResult = await readJsonFromStorage(
        'user-files',
        'Billy Graham/living-in-christ-book.json'
      );

      if (rawResult.success && rawResult.data) {
        diagnostics.push({
          success: true,
          message: `✅ JSON file loaded successfully (${rawResult.data.total_count} total pages)`,
          data: {
            success_count: rawResult.data.success_count,
            total_count: rawResult.data.total_count,
            version: rawResult.data.version,
            pages_count: rawResult.data.pages?.length || 0
          }
        });

        // Test 2: Check page structure
        const samplePage = rawResult.data.pages?.[10];
        if (samplePage) {
          diagnostics.push({
            success: true,
            message: `✅ Page structure is valid (Sample page ${samplePage.page_id} has ${samplePage.content?.length || 0} content items)`,
            data: {
              page_id: samplePage.page_id,
              content_count: samplePage.content?.length || 0,
              sample_text: samplePage.content?.[0]?.text?.substring(0, 100) || 'No text'
            }
          });
        } else {
          diagnostics.push({
            success: false,
            message: '❌ No valid pages found in JSON structure'
          });
        }

        // Test 3: Check content filtering
        const contentPages = rawResult.data.pages?.filter(page => 
          page.content && 
          page.content.length > 0 && 
          page.page_id > 2 && 
          page.page_id < 100
        ) || [];

        diagnostics.push({
          success: true,
          message: `✅ Found ${contentPages.length} content pages after filtering`,
          data: {
            total_pages: rawResult.data.pages?.length || 0,
            filtered_pages: contentPages.length,
            filter_criteria: 'page_id > 2 && page_id < 100 && has content'
          }
        });

      } else {
        diagnostics.push({
          success: false,
          message: `❌ Failed to load JSON file: ${rawResult.error}`
        });
      }

      // Test 4: Check devotional service processing
      try {
        const todaysVerse = await billyGrahamDevotional.getTodaysVerse();
        if (todaysVerse) {
          diagnostics.push({
            success: true,
            message: `✅ Devotional service working - Today's verse loaded (Day ${todaysVerse.day})`,
            data: {
              day: todaysVerse.day,
              title: todaysVerse.title,
              verse_reference: todaysVerse.verse_reference,
              theme: todaysVerse.theme,
              content_length: todaysVerse.devotional_content.length
            }
          });
        } else {
          diagnostics.push({
            success: false,
            message: '❌ Devotional service returned null for today\'s verse'
          });
        }

        // Test 5: Check all devotions
        const allDevotions = await billyGrahamDevotional.getAllDevotions();
        diagnostics.push({
          success: allDevotions.length > 0,
          message: `${allDevotions.length > 0 ? '✅' : '❌'} Processed ${allDevotions.length} devotions`,
          data: {
            devotions_count: allDevotions.length,
            expected_count: 30,
            themes: [...new Set(allDevotions.map(d => d.theme))],
            sample_devotion: allDevotions[0] ? {
              day: allDevotions[0].day,
              title: allDevotions[0].title,
              reference: allDevotions[0].verse_reference
            } : null
          }
        });

        // Test 6: Check search functionality
        const searchResults = await billyGrahamDevotional.searchDevotions('Jesus');
        diagnostics.push({
          success: searchResults.length > 0,
          message: `${searchResults.length > 0 ? '✅' : '⚠️'} Search found ${searchResults.length} results for "Jesus"`,
          data: {
            search_term: 'Jesus',
            results_count: searchResults.length,
            sample_results: searchResults.slice(0, 3).map(r => ({
              day: r.day,
              title: r.title,
              reference: r.verse_reference
            }))
          }
        });

      } catch (serviceError) {
        diagnostics.push({
          success: false,
          message: `❌ Devotional service error: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}`
        });
      }

    } catch (error) {
      diagnostics.push({
        success: false,
        message: `❌ General error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setResults(diagnostics);
    setLoading(false);

    // Show toast with overall result
    const successCount = diagnostics.filter(d => d.success).length;
    const totalCount = diagnostics.length;
    
    toast({
      title: "Diagnostic Complete",
      description: `${successCount}/${totalCount} tests passed`,
      variant: successCount === totalCount ? "default" : "destructive"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Billy Graham Devotional Diagnostic
        </CardTitle>
        <CardDescription>
          Test the Billy Graham JSON file parsing and devotional system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Running Diagnostics...' : 'Run Diagnostic Tests'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Test Results:</h4>
            {results.map((result, index) => (
              <Alert key={index} variant={result.success ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription className="text-sm">
                      {result.message}
                    </AlertDescription>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-4 border-t">
            <div className="text-center">
              <Badge variant="outline" className="text-green-600">
                ✅ {results.filter(r => r.success).length} Passed
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-red-600">
                ❌ {results.filter(r => !r.success).length} Failed
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 