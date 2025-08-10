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
  BookmarkPlus,
  Share,
  MoreHorizontal,
  Reply,
  Send,
  Book,
  Cross,
  Users2,
  Pin,
  Flag,
  Quote,
  ExternalLink,
  Bookmark,
  Copy,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Hand,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { useCommunity } from '@/hooks/useCommunity'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

interface Comment {
  id: string
  user_id: string
  discussion_id: string
  content: string
  parent_comment_id?: string
  likes_count: number
  created_at: string
  author?: {
    name: string
    avatar: string
  }
  replies?: Comment[]
}

const CommunityDiscussions: React.FC = () => {
  const [filter, setFilter] = useState<'latest' | 'popular' | 'verse-based' | 'my-groups'>('latest')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [expandedDiscussions, setExpandedDiscussions] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null)
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    verse_reference: '',
    tags: '',
    discussion_type: 'general' // general, study, testimony, prayer, question
  })

  const { user } = useAuth()
  const { 
    useDiscussions, 
    useCreateDiscussion, 
    useLikeDiscussion,
    useCreateComment,
    useBookmarkDiscussion,
    useTrendingVerses,
    useTopContributors 
  } = useCommunity()

  const { data: discussions = [], isLoading: discussionsLoading } = useDiscussions(filter)
  const { data: trendingVerses = [] } = useTrendingVerses()
  const { data: topContributors = [] } = useTopContributors()
  const createDiscussionMutation = useCreateDiscussion()
  const likeDiscussionMutation = useLikeDiscussion()
  const createCommentMutation = useCreateComment()
  const bookmarkMutation = useBookmarkDiscussion()

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
      setNewDiscussion({ title: '', content: '', verse_reference: '', tags: '', discussion_type: 'general' })
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

  const toggleDiscussionExpansion = (discussionId: string) => {
    setExpandedDiscussions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(discussionId)) {
        newSet.delete(discussionId)
      } else {
        newSet.add(discussionId)
      }
      return newSet
    })
  }

  const handleReply = (discussionId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to reply.",
        variant: "destructive",
      })
      return
    }
    setReplyingTo(discussionId)
  }

  const submitReply = async (discussionId: string) => {
    if (!replyContent.trim() || !user?.id) return

    try {
      await createCommentMutation.mutateAsync({
        discussion_id: discussionId,
        user_id: user.id,
        content: replyContent.trim()
      })
      
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  const handleBookmark = async (discussionId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to bookmark discussions.",
        variant: "destructive",
      })
      return
    }

    try {
      await bookmarkMutation.mutateAsync({
        discussionId,
        isBookmarking: true
      })
    } catch (error) {
      console.error('Error bookmarking discussion:', error)
    }
  }

  const handleShare = (discussionId: string, title: string) => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: `${window.location.origin}/community/discussion/${discussionId}`,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/community/discussion/${discussionId}`)
      toast({
        title: "Link Copied",
        description: "Discussion link copied to clipboard.",
      })
    }
  }

  const lookupVerse = (verse: string) => {
    setSelectedVerse(verse)
    // Here you would integrate with Bible API to show verse details
    toast({
      title: "Verse Lookup",
      description: `Looking up ${verse}...`,
    })
  }

  const discussionTypes = [
    { value: 'general', label: '💬 General Discussion', desc: 'General biblical topics' },
    { value: 'study', label: '📖 Bible Study', desc: 'Deep verse analysis' },
    { value: 'testimony', label: '🙏 Testimony', desc: 'Share God\'s work' },
    { value: 'prayer', label: '🤲 Prayer Request', desc: 'Ask for prayer' },
    { value: 'question', label: '❓ Question', desc: 'Biblical questions' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Filters & Tools */}
      <div className="lg:col-span-1">
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cross className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => setShowNewDiscussion(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Discussion
              </Button>
                             <Button variant="outline" className="w-full justify-start">
                 <Book className="h-4 w-4 mr-2" />
                 Bible Study
               </Button>
               <Button variant="outline" className="w-full justify-start">
                 <Hand className="h-4 w-4 mr-2" />
                 Prayer Request
               </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users2 className="h-4 w-4 mr-2" />
                Ask Community
              </Button>
            </CardContent>
          </Card>

          {/* Filters */}
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
                <Label>Biblical Topics</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Faith', 'Prayer', 'Salvation', 'Love', 'Hope', 'Testimony', 'Prophecy', 'Worship'].map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bible Study Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Study Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                             <Button variant="ghost" className="w-full justify-start text-sm">
                 <Book className="h-4 w-4 mr-2" />
                 Verse Cross-References
               </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                Commentary Insights
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                <Quote className="h-4 w-4 mr-2" />
                Compare Translations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content - Discussions Feed */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Biblical Discussions</h2>
          <Dialog open={showNewDiscussion} onOpenChange={setShowNewDiscussion}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Start a Biblical Discussion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discussion-type">Discussion Type</Label>
                  <Select 
                    value={newDiscussion.discussion_type} 
                    onValueChange={(value) => setNewDiscussion(prev => ({ ...prev, discussion_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {discussionTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col">
                            <span>{type.label}</span>
                            <span className="text-xs text-gray-500">{type.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="What biblical topic would you like to explore?" 
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="verse">Bible Verse Reference (optional)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="verse" 
                      placeholder="e.g., John 3:16, Romans 8:28" 
                      value={newDiscussion.verse_reference}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, verse_reference: e.target.value }))}
                    />
                                         <Button type="button" variant="outline" size="sm">
                       <Book className="h-4 w-4" />
                     </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Add a Bible verse to enhance your discussion</p>
                </div>

                <div>
                  <Label htmlFor="content">Discussion Content</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Share your biblical insights, questions, or testimony. Be specific about what you'd like to discuss..."
                    rows={8}
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm">
                        <Quote className="h-4 w-4 mr-1" />
                        Quote Verse
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <Users2 className="h-4 w-4 mr-1" />
                        Mention
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">{newDiscussion.content.length}/1000</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input 
                    id="tags" 
                    placeholder="faith, salvation, jesus, prayer (comma separated)" 
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Help others find your discussion with relevant tags</p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
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
                <Cross className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to start a meaningful biblical conversation!
                </p>
                <Button onClick={() => setShowNewDiscussion(true)}>
                  Start Biblical Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => {
              const isExpanded = expandedDiscussions.has(discussion.id)
              return (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Author and Time */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={discussion.author?.avatar} />
                          <AvatarFallback>{discussion.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{discussion.author?.name || 'Anonymous'}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(discussion.created_at).toLocaleDateString()} • Biblical Discussion
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleBookmark(discussion.id)}>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Bookmark
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(discussion.id, discussion.title)}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Discussion
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-3 hover:text-blue-600 cursor-pointer">
                      {discussion.title}
                    </h3>

                    {/* Content */}
                    <div className="text-gray-700 mb-4">
                      <p className={isExpanded ? '' : 'line-clamp-3'}>
                        {discussion.content}
                      </p>
                      {discussion.content.length > 200 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleDiscussionExpansion(discussion.id)}
                          className="p-0 h-auto text-blue-600"
                        >
                          {isExpanded ? (
                            <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
                          ) : (
                            <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Verse */}
                    {discussion.verse_reference && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span 
                            className="font-medium text-blue-800 dark:text-blue-300 cursor-pointer hover:underline"
                            onClick={() => lookupVerse(discussion.verse_reference!)}
                          >
                            {discussion.verse_reference}
                          </span>
                          <div className="ml-auto flex gap-1">
                            <Button size="sm" variant="ghost" className="text-blue-600">
                              <Lightbulb className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-600">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {discussion.verse_text && (
                          <p className="text-blue-700 dark:text-blue-300 italic">
                            "{discussion.verse_text}"
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Cross References
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Commentary
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {discussion.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                          #{tag}
                        </Badge>
                      )) || []}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 px-3"
                          onClick={() => handleLikeDiscussion(discussion.id, false)}
                          disabled={likeDiscussionMutation.isPending}
                        >
                          <ArrowUp className="h-4 w-4" />
                          {discussion.likes_count || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="px-3">
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 px-3"
                          onClick={() => handleReply(discussion.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          {discussion.comments_count || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="px-3"
                          onClick={() => handleShare(discussion.id, discussion.title)}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleBookmark(discussion.id)}
                        >
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Reply Section */}
                    {replyingTo === discussion.id && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback>{user?.email?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Share your biblical insights or ask follow-up questions..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={3}
                            />
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex gap-2">
                                <Button type="button" variant="ghost" size="sm">
                                  <Quote className="h-4 w-4 mr-1" />
                                  Quote Verse
                                </Button>
                                <Button type="button" variant="ghost" size="sm">
                                  <Users2 className="h-4 w-4 mr-1" />
                                  Mention
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setReplyingTo(null)}
                                >
                                  Cancel
                                </Button>
                                                                 <Button 
                                   size="sm"
                                   onClick={() => submitReply(discussion.id)}
                                   disabled={!replyContent.trim() || createCommentMutation.isPending}
                                 >
                                   <Send className="h-4 w-4 mr-1" />
                                   {createCommentMutation.isPending ? 'Posting...' : 'Reply'}
                                 </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Right Sidebar - Biblical Resources */}
      <div className="lg:col-span-1 space-y-6">
        {/* Today's Verse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cross className="h-4 w-4" />
              Today's Verse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-blue-700 font-medium">John 3:16</p>
              <p className="text-sm italic mt-2">
                "For God so loved the world that he gave his one and only Son..."
              </p>
              <Button size="sm" variant="outline" className="mt-3">
                Start Discussion
              </Button>
            </div>
          </CardContent>
        </Card>

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
              {trendingVerses.slice(0, 4).map((verse, index) => (
                <div key={verse.reference} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <div>
                    <div className="font-medium text-sm">{verse.reference}</div>
                    <div className="text-xs text-gray-500">{verse.engagement} discussions</div>
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Active Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContributors.slice(0, 3).map((contributor, index) => (
                <div key={contributor.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{contributor.name}</div>
                    <div className="text-xs text-gray-500">{contributor.contributions} contributions</div>
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>✝️ Keep discussions Christ-centered</p>
              <p>📖 Support with Scripture</p>
              <p>❤️ Show love and respect</p>
              <p>🙏 Pray for one another</p>
              <Button size="sm" variant="ghost" className="text-blue-600 p-0">
                Read full guidelines →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CommunityDiscussions 