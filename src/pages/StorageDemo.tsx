import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { JsonFileManager } from '@/components/JsonFileManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  FileText, 
  Upload, 
  Download,
  Code,
  Zap
} from 'lucide-react';
import {
  uploadJsonToStorage,
  readJsonFromStorage,
  getSignedUrl
} from '@/lib/supabase-storage';

interface BibleReadingPlan {
  name: string;
  description: string;
  duration_days: number;
  daily_readings: Array<{
    day: number;
    book: string;
    chapters: string[];
  }>;
}

interface UserPreferences {
  theme: string;
  language: string;
  fontSize: number;
  notifications: {
    dailyVerse: boolean;
    readingReminders: boolean;
    prayerReminders: boolean;
  };
}

const StorageDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sampleData, setSampleData] = useState<any>(null);
  const { toast } = useToast();

  // Example 1: Save user preferences
  const saveUserPreferences = async () => {
    setLoading(true);
    try {
      const preferences: UserPreferences = {
        theme: 'dark',
        language: 'en',
        fontSize: 16,
        notifications: {
          dailyVerse: true,
          readingReminders: true,
          prayerReminders: false
        }
      };

      const result = await uploadJsonToStorage(
        'user-files',
        'preferences/user-settings.json',
        preferences,
        { upsert: true }
      );

      if (result.success) {
        toast({
          title: "Preferences Saved",
          description: "User preferences saved to Supabase Storage",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Load and display data
  const loadSampleData = async () => {
    setLoading(true);
    try {
      const result = await readJsonFromStorage<UserPreferences>(
        'user-files',
        'preferences/user-settings.json'
      );

      if (result.success && result.data) {
        setSampleData(result.data);
        toast({
          title: "Data Loaded",
          description: "Successfully loaded JSON data from storage",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Info",
        description: "No data found - try saving some first!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Save a Bible reading plan
  const saveBiblePlan = async () => {
    setLoading(true);
    try {
      const readingPlan: BibleReadingPlan = {
        name: "30-Day Psalms Study",
        description: "Read through selected Psalms over 30 days",
        duration_days: 30,
        daily_readings: [
          { day: 1, book: "Psalms", chapters: ["1", "2"] },
          { day: 2, book: "Psalms", chapters: ["8", "19"] },
          { day: 3, book: "Psalms", chapters: ["23", "27"] },
          { day: 4, book: "Psalms", chapters: ["46", "47"] },
          { day: 5, book: "Psalms", chapters: ["91", "103"] }
          // Add more days as needed...
        ]
      };

      const result = await uploadJsonToStorage(
        'user-files',
        'reading-plans/psalms-30-day.json',
        readingPlan,
        { upsert: true }
      );

      if (result.success) {
        toast({
          title: "Reading Plan Saved",
          description: "Bible reading plan saved successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save reading plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <UnifiedHeader 
        icon={Database}
        title="Supabase Storage Demo"
        subtitle="Upload, read, and manage JSON files in Supabase Storage"
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              How JSON Storage Works
            </CardTitle>
            <CardDescription>
              This demo shows how to use Supabase Storage for JSON files in your Bible Aura app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Upload</h3>
                <p className="text-sm text-muted-foreground">
                  Save JSON data to buckets
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Download className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold">Read</h3>
                <p className="text-sm text-muted-foreground">
                  Fetch and parse JSON files
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold">Manage</h3>
                <p className="text-sm text-muted-foreground">
                  List, delete, and organize files
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="examples" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="examples">Quick Examples</TabsTrigger>
            <TabsTrigger value="manager">File Manager</TabsTrigger>
            <TabsTrigger value="code">Code Examples</TabsTrigger>
          </TabsList>

          {/* Quick Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Demo Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Demo Actions</CardTitle>
                  <CardDescription>
                    Try these examples to see JSON storage in action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={saveUserPreferences} 
                    disabled={loading}
                    className="w-full"
                  >
                    Save Sample User Preferences
                  </Button>
                  
                  <Button 
                    onClick={saveBiblePlan} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    Save Bible Reading Plan
                  </Button>
                  
                  <Button 
                    onClick={loadSampleData} 
                    disabled={loading}
                    variant="secondary"
                    className="w-full"
                  >
                    Load Sample Data
                  </Button>
                </CardContent>
              </Card>

              {/* Data Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Loaded Data</CardTitle>
                  <CardDescription>
                    JSON data retrieved from storage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sampleData ? (
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(sampleData, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No data loaded yet. Try the "Load Sample Data" button.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Common Use Cases for Bible Aura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">User Data</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• User preferences and settings</li>
                      <li>• Reading progress and bookmarks</li>
                      <li>• Personal prayer lists</li>
                      <li>• Custom verse collections</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Content Data</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Bible reading plans</li>
                      <li>• Sermon notes and outlines</li>
                      <li>• Study guides and materials</li>
                      <li>• Devotional content</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Manager Tab */}
          <TabsContent value="manager">
            <JsonFileManager 
              bucketName="user-files"
              allowUpload={true}
              allowDelete={true}
            />
          </TabsContent>

          {/* Code Examples Tab */}
          <TabsContent value="code" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Basic Usage Examples
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Upload JSON Data</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`import { uploadJsonToStorage } from '@/lib/supabase-storage';

const saveUserData = async () => {
  const userData = {
    name: "John Doe",
    preferences: { theme: "dark" }
  };
  
  const result = await uploadJsonToStorage(
    'user-files',                    // bucket name
    'users/john-doe-data.json',      // file path
    userData,                        // JSON data
    { upsert: true }                 // options
  );
  
  if (result.success) {
    console.log('Saved to:', result.filePath);
  } else {
    console.error('Error:', result.error);
  }
};`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Read JSON Data</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`import { readJsonFromStorage } from '@/lib/supabase-storage';

const loadUserData = async () => {
  const result = await readJsonFromStorage(
    'user-files',                    // bucket name
    'users/john-doe-data.json'       // file path
  );
  
  if (result.success) {
    console.log('Data:', result.data);
    // Use the JSON data in your app
    setUserData(result.data);
  } else {
    console.error('Error:', result.error);
  }
};`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Handle File Upload</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`import { uploadFile } from '@/lib/supabase-storage';

const handleFileUpload = async (file: File) => {
  if (!file.name.endsWith('.json')) {
    alert('Please select a JSON file');
    return;
  }
  
  const result = await uploadFile(
    'user-files',                    // bucket name
    file,                           // File object
    \`uploads/\${file.name}\`,         // destination path
    { upsert: true }                // options
  );
  
  if (result.success) {
    console.log('File uploaded:', result.filePath);
  }
};`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Setup Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Create Storage Bucket</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        In your Supabase dashboard, go to Storage and create a new bucket:
                      </p>
                      <Badge variant="outline" className="font-mono">user-files</Badge>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">2. Set Bucket Policies</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Configure RLS policies for authenticated users:
                      </p>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`-- Allow authenticated users to upload files
INSERT INTO storage.policies (name, bucket_id, policy)
VALUES ('Allow uploads for authenticated users', 'user-files', 
  'CREATE');

-- Allow users to read their own files  
INSERT INTO storage.policies (name, bucket_id, policy)
VALUES ('Allow downloads for authenticated users', 'user-files', 
  'SELECT');`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">3. Import the Functions</h4>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
{`import {
  uploadJsonToStorage,
  readJsonFromStorage,
  uploadFile,
  listFiles,
  deleteFile
} from '@/lib/supabase-storage';`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default StorageDemo; 