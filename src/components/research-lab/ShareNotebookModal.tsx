// Share Notebook Modal - Collaboration and Sharing Dialog
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Share2, 
  X, 
  Copy, 
  UserPlus, 
  Lock, 
  Globe,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareNotebookModalProps {
  open: boolean;
  onClose: () => void;
  notebookId: string;
  notebookTitle: string;
}

interface Share {
  id: string;
  shared_by: string;
  shared_with: string | null;
  permission: 'owner' | 'editor' | 'viewer';
  access_type: 'user' | 'link';
  share_token: string | null;
  notify_user: boolean;
  user_email?: string;
  user_name?: string;
  user_avatar?: string;
}

export function ShareNotebookModal({ 
  open, 
  onClose, 
  notebookId,
  notebookTitle 
}: ShareNotebookModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifyPeople, setNotifyPeople] = useState(true);
  const [accessLevel, setAccessLevel] = useState<'restricted' | 'anyone_with_link'>('restricted');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loadingShares, setLoadingShares] = useState(true);

  useEffect(() => {
    if (open && notebookId && user) {
      loadShares();
    }
  }, [open, notebookId, user]);

  const loadShares = async () => {
    if (!notebookId || !user) return;

    setLoadingShares(true);
    try {
      // Load user shares
      const { data: sharesData, error: sharesError } = await supabase
        .from('research_notebook_shares')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;

      // Load owner info
      const { data: notebookData, error: notebookError } = await supabase
        .from('research_notebooks')
        .select('user_id')
        .eq('id', notebookId)
        .single();

      if (notebookError) throw notebookError;

      // Enrich shares with user info
      const enrichedShares: Share[] = [];
      
      // Add owner
      if (notebookData?.user_id) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, email')
          .eq('user_id', notebookData.user_id)
          .single();
        
        enrichedShares.push({
          id: 'owner',
          shared_by: notebookData.user_id,
          shared_with: notebookData.user_id,
          permission: 'owner',
          access_type: 'user',
          share_token: null,
          notify_user: false,
          user_email: ownerProfile?.email || '',
          user_name: ownerProfile?.display_name || 'Owner',
          user_avatar: ownerProfile?.avatar_url || undefined,
        });
      }

      // Add other shares
      for (const share of sharesData || []) {
        if (share.shared_with) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, email')
            .eq('user_id', share.shared_with)
            .single();
          
          enrichedShares.push({
            ...share,
            user_email: userProfile?.email || '',
            user_name: userProfile?.display_name || 'User',
            user_avatar: userProfile?.avatar_url || undefined,
          });
        } else if (share.access_type === 'link') {
          // Link share
          enrichedShares.push(share);
          if (share.share_token) {
            setShareLink(`${window.location.origin}/research-lab/shared/${share.share_token}`);
          }
        }
      }

      setShares(enrichedShares);

      // Load notebook share settings
      const { data: notebookSettings } = await supabase
        .from('research_notebooks')
        .select('is_public, share_settings')
        .eq('id', notebookId)
        .single();

      if (notebookSettings) {
        setAccessLevel(notebookSettings.is_public ? 'anyone_with_link' : 'restricted');
        if (notebookSettings.share_settings) {
          const settings = notebookSettings.share_settings as any;
          setAccessLevel(settings.access_type || 'restricted');
        }
      }
    } catch (error: any) {
      console.error('Error loading shares:', error);
      toast({
        title: 'Error',
        description: 'Failed to load share settings',
        variant: 'destructive',
      });
    } finally {
      setLoadingShares(false);
    }
  };

  const handleAddPerson = async () => {
    if (!emailInput.trim() || !user || !notebookId) return;

    setLoading(true);
    try {
      // Find user by email in profiles table
      const { data: userProfile, error: findError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('email', emailInput.toLowerCase().trim())
        .single();
      
      if (findError || !userProfile) {
        toast({
          title: 'User not found',
          description: 'No user found with this email address. They need to sign up first.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (userProfile.user_id === user.id) {
        toast({
          title: 'Cannot share with yourself',
          description: 'You already have access to this notebook',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create share
      const { error: shareError } = await supabase
        .from('research_notebook_shares')
        .insert({
          notebook_id: notebookId,
          shared_by: user.id,
          shared_with: userProfile.user_id,
          permission: 'viewer',
          access_type: 'user',
          notify_user: notifyPeople,
        });

      if (shareError) {
        if (shareError.code === '23505') {
          toast({
            title: 'Already shared',
            description: 'This user already has access to this notebook',
            variant: 'destructive',
          });
        } else {
          throw shareError;
        }
      } else {
        toast({
          title: 'Shared successfully',
          description: `Notebook shared with ${emailInput}`,
        });
        setEmailInput('');
        loadShares();
      }
    } catch (error: any) {
      console.error('Error sharing notebook:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to share notebook',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: 'owner' | 'editor' | 'viewer') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('research_notebook_shares')
        .update({ permission: newPermission })
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Permission updated',
        description: 'User permission has been updated',
      });
      loadShares();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to remove this user\'s access?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('research_notebook_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: 'Access removed',
        description: 'User access has been removed',
      });
      loadShares();
    } catch (error: any) {
      console.error('Error removing share:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove access',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink && notebookId && user) {
      // Generate share link token
      try {
        // Generate a random token
        const generateToken = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let token = '';
          for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return token;
        };

        let token = generateToken();
        let attempts = 0;
        let tokenExists = true;

        // Ensure unique token
        while (tokenExists && attempts < 10) {
          const { data: existing } = await supabase
            .from('research_notebook_shares')
            .select('id')
            .eq('share_token', token)
            .single();

          if (!existing) {
            tokenExists = false;
          } else {
            token = generateToken();
            attempts++;
          }
        }

        // Create share record
        const { data: share, error } = await supabase
          .from('research_notebook_shares')
          .insert({
            notebook_id: notebookId,
            shared_by: user.id,
            permission: 'viewer',
            access_type: 'link',
            share_token: token,
            notify_user: false,
          })
          .select()
          .single();

        if (error) throw error;

        const link = `${window.location.origin}/research-lab/shared/${token}`;
        setShareLink(link);
        await navigator.clipboard.writeText(link);
        toast({
          title: 'Link copied',
          description: 'Share link has been copied to clipboard',
        });
        loadShares(); // Refresh shares list
      } catch (error: any) {
        console.error('Error creating share link:', error);
        toast({
          title: 'Error',
          description: 'Failed to create share link',
          variant: 'destructive',
        });
      }
    } else if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: 'Link copied',
        description: 'Share link has been copied to clipboard',
      });
    }
  };

  const handleUpdateAccessLevel = async (level: 'restricted' | 'anyone_with_link') => {
    if (!notebookId || !user) return;

    setAccessLevel(level);
    
    try {
      const { error } = await supabase
        .from('research_notebooks')
        .update({
          is_public: level === 'anyone_with_link',
          share_settings: {
            access_type: level,
            allow_link_sharing: level === 'anyone_with_link',
          },
        })
        .eq('id', notebookId);

      if (error) throw error;

      toast({
        title: 'Access level updated',
        description: `Notebook access set to ${level === 'restricted' ? 'Restricted' : 'Anyone with link'}`,
      });
    } catch (error: any) {
      console.error('Error updating access level:', error);
      toast({
        title: 'Error',
        description: 'Failed to update access level',
        variant: 'destructive',
      });
      // Revert on error
      setAccessLevel(level === 'restricted' ? 'anyone_with_link' : 'restricted');
    }
  };

  const getUserInitials = (name: string, email: string) => {
    if (name && name !== email) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.split('@')[0].charAt(0).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-orange-600" />
            Share '{notebookTitle}'
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add people and groups */}
          <div className="space-y-2">
            <Label htmlFor="email-input">Add people and groups</Label>
            <div className="flex gap-2">
              <Input
                id="email-input"
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddPerson();
                  }
                }}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleAddPerson}
                disabled={!emailInput.trim() || loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyPeople}
                onCheckedChange={(checked) => setNotifyPeople(checked === true)}
              />
              <Label htmlFor="notify" className="text-sm font-normal cursor-pointer">
                Notify people
              </Label>
            </div>
          </div>

          {/* People with access */}
          <div className="space-y-2">
            <Label>People with access</Label>
            {loadingShares ? (
              <div className="text-sm text-gray-500 py-4">Loading...</div>
            ) : (
              <div className="space-y-2 border rounded-lg p-2">
                {shares
                  .filter(share => share.access_type === 'user')
                  .map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={share.user_avatar} />
                          <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                            {getUserInitials(share.user_name || '', share.user_email || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {share.user_name || share.user_email || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {share.user_email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {share.id !== 'owner' ? (
                          <>
                            <Select
                              value={share.permission}
                              onValueChange={(value: 'owner' | 'editor' | 'viewer') =>
                                handleUpdatePermission(share.id, value)
                              }
                            >
                              <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveShare(share.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 px-2">Owner</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Notebook access */}
          <div className="space-y-2">
            <Label>Notebook access</Label>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {accessLevel === 'restricted' ? (
                    <Lock className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-gray-500" />
                  )}
                  <Select
                    value={accessLevel}
                    onValueChange={(value: 'restricted' | 'anyone_with_link') =>
                      handleUpdateAccessLevel(value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="anyone_with_link">Anyone with the link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {accessLevel === 'restricted'
                  ? 'Only people with access can open with the link'
                  : 'Anyone with the link can view this notebook'}
              </p>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                {shareLink ? 'Copy link' : 'Generate link'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

