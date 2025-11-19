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
          {/* Header - Enhanced */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105">
                <FlaskConical className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Research Lab
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1.5 hidden sm:block">
                  Upload sources and chat with AI about your Bible research
                </p>
              </div>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full sm:w-auto text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-2">
                    <CardContent className="p-5 sm:p-6">
                      <div className="h-28 sm:h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {/* Create New Notebook Card - Enhanced */}
                <Card
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-orange-400 active:scale-95 touch-manipulation group bg-gradient-to-br from-white to-orange-50/30"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <CardContent className="p-5 sm:p-7 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px]">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4 sm:mb-5 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <Plus className="h-7 w-7 sm:h-9 sm:w-9 text-blue-600" />
                    </div>
                    <p className="text-base sm:text-lg text-gray-800 font-semibold text-center group-hover:text-orange-600 transition-colors">
                      Create new notebook
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 text-center">
                      Start your Bible research journey
                    </p>
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

