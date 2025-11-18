// Research Lab Dashboard - NotebookLM-style interface
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/ModernLayout';
import { useSEO, SEO_CONFIG } from '@/hooks/useSEO';
import { getUserNotebooks, clearNotebooksCache, type Notebook } from '@/lib/research-lab/db-operations';
import { 
  Plus, 
  MoreVertical, 
  FileText, 
  Calendar,
  ChevronRight,
  FlaskConical,
  Globe,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateNotebookModal } from '@/components/research-lab/CreateNotebookModal';
import { NotebookCard } from '@/components/research-lab/NotebookCard';

// Notebook type imported from db-operations

export default function ResearchLab() {
  useSEO(SEO_CONFIG.RESEARCH_LAB || { title: 'Research Lab - Bible Aura', description: 'Advanced Bible research with AI' });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotebooks();
    }
  }, [user]);

  const loadNotebooks = async () => {
    if (!user) return;
    
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const { data, error } = await getUserNotebooks(user.id, 10);
      if (error) throw error;
      
      const loadTime = performance.now() - startTime;
      console.log(`Notebooks loaded in ${loadTime.toFixed(2)}ms`);
      
      setNotebooks(data || []);
    } catch (error: any) {
      console.error('Error loading notebooks:', error);
      
      // Check if it's a table doesn't exist error
      const isTableMissing = error?.message?.includes('relation') && 
                             error?.message?.includes('does not exist');
      
      if (isTableMissing) {
        toast({
          title: 'Database Setup Required',
          description: 'Research Lab tables need to be created. Go to Supabase Dashboard → SQL Editor, open supabase/migrations/20241118000000_create_research_lab_tables.sql, copy the SQL, and run it.',
          variant: 'destructive',
          duration: 10000,
        });
      } else {
        toast({
          title: 'Error',
          description: error?.message || 'Failed to load notebooks. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotebook = (notebookId: string) => {
    // Clear cache and reload notebooks after creation
    if (user) {
      clearNotebooksCache(user.id);
      loadNotebooks();
    }
    navigate(`/research-lab/${notebookId}`);
  };

  return (
    <ModernLayout>
      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <FlaskConical className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Research Lab</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Upload sources and chat with AI about your Bible research</p>
              </div>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Notebook</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {/* Recent Notebooks Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent notebooks</h2>
              {notebooks.length > 0 && (
                <Button variant="ghost" size="sm" className="text-gray-600 text-xs sm:text-sm">
                  <span className="hidden sm:inline">See all</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
                </Button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-24 sm:h-32 bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Create New Notebook Card */}
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-gray-300 hover:border-orange-400 active:scale-95 touch-manipulation"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3 sm:mb-4">
                      <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium text-center">Create new notebook</p>
                  </CardContent>
                </Card>

                {/* Existing Notebooks */}
                {notebooks.map((notebook) => (
                  <NotebookCard
                    key={notebook.id}
                    notebook={notebook}
                    onSelect={() => navigate(`/research-lab/${notebook.id}`)}
                    onDelete={loadNotebooks}
                  />
                ))}
              </div>
            )}

            {!loading && notebooks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No notebooks yet</p>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first notebook
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create Notebook Modal */}
        <CreateNotebookModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleCreateNotebook}
        />
      </div>
    </ModernLayout>
  );
}

