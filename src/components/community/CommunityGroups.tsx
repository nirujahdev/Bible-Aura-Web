import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  Users, 
  Plus,
  Search,
  Lock,
  Globe,
  MessageSquare,
  Calendar,
  Star,
  Settings,
  UserPlus,
  ArrowLeft,
  Send,
  ThumbsUp,
  MoreVertical,
  Crown,
  Shield,
  Heart,
  BookOpen,
  MapPin,
  Clock,
  UserMinus,
  Share,
  Edit,
  Copy
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

interface Group {
  id: string
  name: string
  description: string
  banner: string
  memberCount: number
  isPrivate: boolean
  category: string
  leader: {
    name: string
    avatar: string
    id: string
  }
  moderators: Array<{
    name: string
    avatar: string
    id: string
  }>
  recentActivity: string
  tags: string[]
  isJoined: boolean
  inviteCode?: string
  schedule?: string
  rules?: string
  posts: Array<{
    id: string
    author: {
      name: string
      avatar: string
      id: string
      role: 'leader' | 'moderator' | 'member'
    }
    content: string
    verse?: string
    timestamp: string
    likes: number
    comments: number
    isLiked: boolean
  }>
  members: Array<{
    id: string
    name: string
    avatar: string
    role: 'leader' | 'moderator' | 'member'
    joinedDate: string
    lastActive: string
  }>
}

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    id: string
    role: 'leader' | 'moderator' | 'member'
  }
  content: string
  verse?: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
}

const CommunityGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'Bible in a Year',
      description: 'Join us as we read through the entire Bible together in one year. Daily discussions, encouragement, and accountability.',
      banner: '/placeholder.svg',
      memberCount: 2847,
      isPrivate: false,
      category: 'Bible Study',
      leader: {
        name: 'Pastor Sarah',
        avatar: '/placeholder.svg',
        id: 'leader1'
      },
      moderators: [
        { name: 'David Kim', avatar: '/placeholder.svg', id: 'mod1' },
        { name: 'Rachel Green', avatar: '/placeholder.svg', id: 'mod2' }
      ],
      recentActivity: '2 hours ago',
      tags: ['Bible Reading', 'Accountability', 'Community'],
      isJoined: true,
      inviteCode: 'BIY2024',
      schedule: 'Daily discussions at 7 PM EST',
      rules: 'Be respectful, stay on topic, encourage one another',
      posts: [
        {
          id: 'p1',
          author: {
            name: 'Pastor Sarah',
            avatar: '/placeholder.svg',
            id: 'leader1',
            role: 'leader'
          },
          content: 'Today we read Genesis 1-3. What stood out to you about God\'s creation and the fall? Let\'s discuss how this foundation shapes our understanding of redemption.',
          verse: 'Genesis 1:1',
          timestamp: '2 hours ago',
          likes: 24,
          comments: 18,
          isLiked: false
        },
        {
          id: 'p2',
          author: {
            name: 'Michael Chen',
            avatar: '/placeholder.svg',
            id: 'member1',
            role: 'member'
          },
          content: 'I\'m amazed by how God called everything "good" and then humanity "very good." It reminds me that we have inherent worth despite our fallen nature.',
          timestamp: '1 hour ago',
          likes: 12,
          comments: 5,
          isLiked: true
        }
      ],
      members: [
        {
          id: 'leader1',
          name: 'Pastor Sarah',
          avatar: '/placeholder.svg',
          role: 'leader',
          joinedDate: '2023-01-01',
          lastActive: '2 hours ago'
        },
        {
          id: 'mod1',
          name: 'David Kim',
          avatar: '/placeholder.svg',
          role: 'moderator',
          joinedDate: '2023-01-15',
          lastActive: '3 hours ago'
        },
        {
          id: 'member1',
          name: 'Michael Chen',
          avatar: '/placeholder.svg',
          role: 'member',
          joinedDate: '2023-02-01',
          lastActive: '1 hour ago'
        }
      ]
    },
    {
      id: '2',
      name: 'Apologetics & Theology',
      description: 'Dive deep into Christian apologetics and theology. Respectful discussions about faith, doctrine, and difficult questions.',
      banner: '/placeholder.svg',
      memberCount: 1243,
      isPrivate: false,
      category: 'Theology',
      leader: {
        name: 'Dr. Michael Chen',
        avatar: '/placeholder.svg',
        id: 'leader2'
      },
      moderators: [],
      recentActivity: '4 hours ago',
      tags: ['Apologetics', 'Theology', 'Doctrine'],
      isJoined: false,
      posts: [],
      members: []
    },
    {
      id: '3',
      name: 'Youth Bible Study',
      description: 'A vibrant community for young believers (13-25) to explore faith, ask questions, and grow together.',
      banner: '/placeholder.svg',
      memberCount: 567,
      isPrivate: true,
      category: 'Age Group',
      leader: {
        name: 'Youth Pastor Mark',
        avatar: '/placeholder.svg',
        id: 'leader3'
      },
      moderators: [],
      recentActivity: '1 day ago',
      tags: ['Youth', 'Growth', 'Questions'],
      isJoined: false,
      posts: [],
      members: []
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [groupActiveTab, setGroupActiveTab] = useState('posts')
  const [newPost, setNewPost] = useState('')
  const [newPostVerse, setNewPostVerse] = useState('')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'bible-study', label: 'Bible Study' },
    { value: 'theology', label: 'Theology' },
    { value: 'age-group', label: 'Age Groups' },
    { value: 'topical', label: 'Topical Studies' },
    { value: 'prayer', label: 'Prayer Groups' },
    { value: 'missions', label: 'Missions' }
  ]

  const joinedGroups = groups.filter(group => group.isJoined)

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      )
    )
  }

  const handleCreatePost = () => {
    if (!newPost.trim() || !selectedGroup) return
    
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        avatar: '/placeholder.svg',
        id: 'current-user',
        role: 'member'
      },
      content: newPost,
      verse: newPostVerse || undefined,
      timestamp: 'just now',
      likes: 0,
      comments: 0,
      isLiked: false
    }

    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? { ...group, posts: [post, ...group.posts] }
          : group
      )
    )

    setSelectedGroup(prev => prev ? { ...prev, posts: [post, ...prev.posts] } : null)
    setNewPost('')
    setNewPostVerse('')
  }

  const handleLikePost = (postId: string) => {
    if (!selectedGroup) return
    
    const updatedPosts = selectedGroup.posts.map(post =>
      post.id === postId
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    )
    
    setSelectedGroup({ ...selectedGroup, posts: updatedPosts })
    setGroups(prev =>
      prev.map(group =>
        group.id === selectedGroup.id
          ? { ...group, posts: updatedPosts }
          : group
      )
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader':
        return <Crown className="h-3 w-3 text-yellow-500" />
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Leader</Badge>
      case 'moderator':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Moderator</Badge>
      default:
        return <Badge variant="outline">Member</Badge>
    }
  }

  if (selectedGroup) {
    return (
      <div className="space-y-6">
        {/* Group Header */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-4 left-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setSelectedGroup(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Groups
              </Button>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedGroup.name}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedGroup.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedGroup.isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      {selectedGroup.isPrivate ? 'Private' : 'Public'}
                    </div>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {selectedGroup.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Group Navigation */}
        <Tabs value={groupActiveTab} onValueChange={setGroupActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts & Discussions</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Share your thoughts, insights, or questions with the group..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Related verse (optional)"
                          value={newPostVerse}
                          onChange={(e) => setNewPostVerse(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPost.trim()}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts */}
                <div className="space-y-4">
                  {selectedGroup.posts.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{post.author.name}</span>
                                {getRoleIcon(post.author.role)}
                                {getRoleBadge(post.author.role)}
                              </div>
                              <span className="text-sm text-gray-500">{post.timestamp}</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Related Verse */}
                        {post.verse && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 border-l-4 border-blue-500">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-blue-800 dark:text-blue-300">
                                {post.verse}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Post Content */}
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                        {/* Post Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center gap-2 ${post.isLiked ? 'text-red-600' : ''}`}
                            >
                              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                              {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              {post.comments}
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Group Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Group Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{selectedGroup.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>Online & In-Person</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGroup.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Group Leader */}
                <Card>
                  <CardHeader>
                    <CardTitle>Group Leader</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedGroup.leader.avatar} />
                        <AvatarFallback>{selectedGroup.leader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedGroup.leader.name}</span>
                          <Crown className="h-3 w-3 text-yellow-500" />
                        </div>
                        <span className="text-sm text-gray-500">Group Leader</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Posts this week</span>
                      <Badge>12</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active members</span>
                      <Badge variant="outline">247</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last activity</span>
                      <span className="text-gray-500">{selectedGroup.recentActivity}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Members ({selectedGroup.memberCount})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedGroup.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{member.name}</span>
                                {getRoleIcon(member.role)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Active {member.lastActive}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(member.role)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                                {member.role === 'member' && (
                                  <DropdownMenuItem>
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Invite Code</Label>
                      <div className="flex gap-2">
                        <Input value={selectedGroup.inviteCode} readOnly />
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite People
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2">No events yet</h3>
                  <p className="text-sm mb-4">Create events to bring the group together</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Group</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{selectedGroup.description}</p>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Group Rules</h4>
                    <p className="text-sm text-gray-600">{selectedGroup.rules}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Meeting Schedule</h4>
                    <p className="text-sm text-gray-600">{selectedGroup.schedule}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Group Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Members</span>
                    <Badge>{selectedGroup.memberCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Posts This Month</span>
                    <Badge variant="outline">42</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active This Week</span>
                    <Badge variant="secondary">28 members</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Group Created</span>
                    <span className="text-sm text-gray-500">Jan 2023</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Create */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create a New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input id="group-name" placeholder="Enter group name" />
                </div>
                <div>
                  <Label htmlFor="group-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="group-description">Description</Label>
                  <Textarea 
                    id="group-description" 
                    placeholder="Describe your group's purpose and what members can expect..." 
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="private-group" className="rounded" />
                  <Label htmlFor="private-group">Make this a private group (invite only)</Label>
                </div>
                <div>
                  <Label htmlFor="group-tags">Tags</Label>
                  <Input id="group-tags" placeholder="bible, prayer, youth (comma separated)" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateGroup(false)}>
                    Create Group
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discover">Discover Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({joinedGroups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Featured Groups */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Featured Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => group.isJoined && setSelectedGroup(group)}>
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
                    <div className="absolute top-2 right-2">
                      {group.isPrivate ? (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{group.name}</h4>
                        <Badge variant="outline">{group.category}</Badge>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.memberCount}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={group.leader.avatar} />
                        <AvatarFallback>{group.leader.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">Led by {group.leader.name}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {group.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Active {group.recentActivity}
                      </span>
                      {group.isJoined ? (
                        <Badge className="bg-green-500">
                          <Users className="h-3 w-3 mr-1" />
                          Joined
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoinGroup(group.id)
                          }}
                        >
                          <UserPlus className="h-3 w-3" />
                          {group.isPrivate ? 'Request' : 'Join'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-6">
          {joinedGroups.length === 0 ? (
            <Card className="text-center p-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-gray-600 mb-4">
                Join groups to connect with other believers and grow in your faith together.
              </p>
              <Button onClick={() => setActiveTab('discover')}>
                Discover Groups
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joinedGroups.map((group) => (
                <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedGroup(group)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{group.name}</h4>
                        <Badge variant="outline">{group.category}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="h-3 w-3" />
                        {group.memberCount} members
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MessageSquare className="h-3 w-3" />
                        12 new posts
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Active {group.recentActivity}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Discuss
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Events
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CommunityGroups 