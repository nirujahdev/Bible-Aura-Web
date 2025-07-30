import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  Trash2, 
  Eye, 
  RefreshCw,
  FolderOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  uploadJsonToStorage,
  readJsonFromStorage,
  uploadFile,
  listFiles,
  deleteFile,
  getPublicFileUrl,
  getSignedUrl
} from '@/lib/supabase-storage';

interface JsonFileManagerProps {
  bucketName: string;
  folderPath?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  className?: string;
}

interface FileItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, unknown>;
}

export function JsonFileManager({ 
  bucketName = 'user-files',
  folderPath = '',
  allowUpload = true,
  allowDelete = true,
  className = ''
}: JsonFileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [jsonContent, setJsonContent] = useState<unknown>(null);
  const [uploadContent, setUploadContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load files from bucket
  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await listFiles(bucketName, folderPath);
      
      if (result.success && result.files) {
        // Filter for JSON files
        const jsonFiles = result.files.filter(file => 
          file.name.endsWith('.json') && file.name !== '.emptyFolderPlaceholder'
        );
        setFiles(jsonFiles);
        setSuccess(`Loaded ${jsonFiles.length} JSON files`);
      } else {
        setError(result.error || 'Failed to load files');
      }
    } catch (err) {
      setError('Error loading files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Read and display JSON file content
  const readJsonFile = async (file: FileItem) => {
    setLoading(true);
    setError(null);
    
    try {
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
      const result = await readJsonFromStorage(bucketName, filePath);
      
      if (result.success && result.data) {
        setSelectedFile(file);
        setJsonContent(result.data);
        setSuccess('File loaded successfully');
        toast({
          title: "File Loaded",
          description: `Successfully loaded ${file.name}`,
        });
      } else {
        setError(result.error || 'Failed to read file');
      }
    } catch (err) {
      setError('Error reading file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload JSON content as file
  const uploadJsonContent = async () => {
    if (!fileName.trim() || !uploadContent.trim()) {
      setError('Please provide both file name and content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate JSON
      const jsonData = JSON.parse(uploadContent);
      
      const filePath = folderPath 
        ? `${folderPath}/${fileName.endsWith('.json') ? fileName : fileName + '.json'}`
        : `${fileName.endsWith('.json') ? fileName : fileName + '.json'}`;
      
      const result = await uploadJsonToStorage(bucketName, filePath, jsonData, {
        upsert: true
      });
      
      if (result.success) {
        setSuccess('File uploaded successfully');
        setUploadContent('');
        setFileName('');
        await loadFiles(); // Refresh file list
        toast({
          title: "Upload Successful",
          description: `File ${fileName} uploaded to ${bucketName}`,
        });
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format');
      } else {
        setError('Upload failed');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file input upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
      
      const result = await uploadFile(bucketName, file, filePath, {
        upsert: true
      });
      
      if (result.success) {
        setSuccess(`File ${file.name} uploaded successfully`);
        await loadFiles(); // Refresh file list
        toast({
          title: "Upload Successful",
          description: `File ${file.name} uploaded to ${bucketName}`,
        });
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
      console.error(err);
    } finally {
      setLoading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete file
  const deleteJsonFile = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
      
      const result = await deleteFile(bucketName, filePath);
      
      if (result.success) {
        setSuccess(`File ${file.name} deleted successfully`);
        await loadFiles(); // Refresh file list
        if (selectedFile?.name === file.name) {
          setSelectedFile(null);
          setJsonContent(null);
        }
        toast({
          title: "File Deleted",
          description: `${file.name} has been deleted`,
        });
      } else {
        setError(result.error || 'Delete failed');
      }
    } catch (err) {
      setError('Delete failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get file URL
  const getFileUrl = async (file: FileItem) => {
    try {
      const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
      const result = await getSignedUrl(bucketName, filePath);
      
      if (result.success && result.url) {
        navigator.clipboard.writeText(result.url);
        toast({
          title: "URL Copied",
          description: "File URL copied to clipboard",
        });
      } else {
        setError('Failed to generate URL');
      }
    } catch (err) {
      setError('Failed to generate URL');
    }
  };

  React.useEffect(() => {
    loadFiles();
  }, [bucketName, folderPath]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            JSON File Manager
          </h2>
          <p className="text-muted-foreground">
            Bucket: <Badge variant="outline">{bucketName}</Badge>
            {folderPath && (
              <> / Path: <Badge variant="outline">{folderPath}</Badge></>
            )}
          </p>
        </div>
        <Button onClick={loadFiles} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* File Upload Section */}
        {allowUpload && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload JSON File
              </CardTitle>
              <CardDescription>
                Upload JSON files to Supabase Storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Input Upload */}
              <div>
                <Label htmlFor="file-upload">Select JSON File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </div>

              <div className="text-center text-muted-foreground">OR</div>

              {/* Manual JSON Input */}
              <div className="space-y-2">
                <Label htmlFor="filename">File Name</Label>
                <Input
                  id="filename"
                  placeholder="my-data.json"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="json-content">JSON Content</Label>
                <Textarea
                  id="json-content"
                  placeholder='{"key": "value", "array": [1, 2, 3]}'
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  rows={6}
                  disabled={loading}
                />
              </div>

              <Button 
                onClick={uploadJsonContent} 
                disabled={loading || !fileName.trim() || !uploadContent.trim()}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload JSON
              </Button>
            </CardContent>
          </Card>
        )}

        {/* File List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              JSON Files ({files.length})
            </CardTitle>
            <CardDescription>
              Available JSON files in the bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No JSON files found
              </p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id || file.name}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(file.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => readJsonFile(file)}
                        disabled={loading}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => getFileUrl(file)}
                        disabled={loading}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {allowDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteJsonFile(file)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* JSON Content Display */}
      {selectedFile && jsonContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedFile.name}
            </CardTitle>
            <CardDescription>
              JSON file content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
              {JSON.stringify(jsonContent, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 