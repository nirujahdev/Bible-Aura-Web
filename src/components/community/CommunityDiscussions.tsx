import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  MessageSquare, 
  Heart, 
  BookOpen, 
  Filter, 
  Search, 
  Plus,
  ThumbsUp,
  MessageCircle,
  Star,
  BookmarkPlus
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCommunity } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface Discussion {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
  }
  verse: {
    reference: string
    text: string
  }
  likes: number
  comments: number
  timeAgo: string
  tags: string[]
}

const CommunityDiscussions: React.FC = () => {
  const [filter, setFilter] = useState<'latest' | 'popular' | 'verse-based' | 'my-groups'>('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    verse_reference: '',
    tags: ''
  })

  const { user } = useAuth()
  const { 
    useDiscussions, 
    useCreateDiscussion, 
    useLikeDiscussion,
    useTrendingVerses,
    useTopContributors 
  } = useCommunity()

  const { data: discussions = [], isLoading: discussionsLoading } = useDiscussions(filter)
  const { data: trendingVerses = [] } = useTrendingVerses()
  const { data: topContributors = [] } = useTopContributors()
  const createDiscussionMutation = useCreateDiscussion()
  const likeDiscussionMutation = useLikeDiscussion()

  const handleCreateDiscussion = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a discussion.",
        variant: "destructive",
      })
      return
    }

    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your discussion.",
        variant: "destructive",
      })
      return
    }

    const discussionData = {
      user_id: user.id,
      title: newDiscussion.title.trim(),
      content: newDiscussion.content.trim(),
      verse_reference: newDiscussion.verse_reference.trim() || undefined,
      tags: newDiscussion.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    try {
      await createDiscussionMutation.mutateAsync(discussionData)
      setNewDiscussion({ title: '', content: '', verse_reference: '', tags: '' })
      setShowNewDiscussion(false)
    } catch (error) {
      console.error('Error creating discussion:', error)
    }
  }

  const handleLikeDiscussion = async (discussionId: string, isCurrentlyLiked: boolean) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like discussions.",
        variant: "destructive",
      })
      return
    }

    try {
      await likeDiscussionMutation.mutateAsync({
        discussionId,
        isLiking: !isCurrentlyLiked
      })
    } catch (error) {
      console.error('Error liking discussion:', error)
    }
  }



  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Filters */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="filter-select">Sort by</Label>
              <Select value={filter} onValueChange={(value) => setFilter(value as 'latest' | 'popular' | 'verse-based' | 'my-groups')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="verse-based">Verse-Based</SelectItem>
                  <SelectItem value="my-groups">My Groups Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Search Discussions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by title, verse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Popular Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Faith', 'Prayer', 'Salvation', 'Love', 'Hope', 'Testimony'].map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Discussions Feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* New Discussion Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Recent Discussions</h2>
          <Dialog open={showNewDiscussion} onOpenChange={setShowNewDiscussion}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Start a New Discussion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="What would you like to discuss?" 
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="verse">Related Verse (optional)</Label>
                  <Input 
                    id="verse" 
                    placeholder="e.g., John 3:16" 
                    value={newDiscussion.verse_reference}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, verse_reference: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Share your thoughts, questions, or testimony..." 
                    rows={6}
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input 
                    id="tags" 
                    placeholder="faith, prayer, testimony (comma separated)" 
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewDiscussion(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateDiscussion}
                    disabled={createDiscussionMutation.isPending}
                  >
                    {createDiscussionMutation.isPending ? 'Posting...' : 'Post Discussion'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Discussions Feed */}
        <div className="space-y-4">
          {discussionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to start a meaningful conversation!
                </p>
                <Button onClick={() => setShowNewDiscussion(true)}>
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Author and Time */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={discussion.author?.avatar} />
                      <AvatarFallback>{discussion.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{discussion.author?.name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(discussion.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-3 hover:text-blue-600 cursor-pointer">
                    {discussion.title}
                  </h3>

                  {/* Content */}
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {discussion.content}
                  </p>

                  {/* Verse */}
                  {discussion.verse_reference && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {discussion.verse_reference}
                        </span>
                        <Button size="sm" variant="ghost" className="ml-auto">
                          AI Context
                        </Button>
                      </div>
                      {discussion.verse_text && (
                        <p className="text-blue-700 dark:text-blue-300 italic">
                          "{discussion.verse_text}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    )) || []}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => handleLikeDiscussion(discussion.id, false)}
                        disabled={likeDiscussionMutation.isPending}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {discussion.likes_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {discussion.comments_count || 0}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right Sidebar - Trending & Contributors */}
      <div className="lg:col-span-1 space-y-6">
        {/* Trending Verses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Trending Verses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingVerses.map((verse, index) => (
                <div key={verse.reference} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <div>
                    <div className="font-medium">{verse.reference}</div>
                    <div className="text-sm text-gray-500">{verse.engagement} engagements</div>
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={contributor.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{contributor.name}</div>
                    <div className="text-sm text-gray-500">{contributor.contributions} posts</div>
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CommunityDiscussions 