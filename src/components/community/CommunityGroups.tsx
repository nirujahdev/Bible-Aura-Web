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
  UserPlus
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

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
  }
  recentActivity: string
  tags: string[]
  isJoined: boolean
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
        avatar: '/placeholder.svg'
      },
      recentActivity: '2 hours ago',
      tags: ['Bible Reading', 'Accountability', 'Community'],
      isJoined: true
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
        avatar: '/placeholder.svg'
      },
      recentActivity: '4 hours ago',
      tags: ['Apologetics', 'Theology', 'Doctrine'],
      isJoined: false
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
        avatar: '/placeholder.svg'
      },
      recentActivity: '1 day ago',
      tags: ['Youth', 'Growth', 'Questions'],
      isJoined: false
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [activeTab, setActiveTab] = useState('discover')

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
                <Card key={group.id} className="hover:shadow-md transition-shadow">
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
                        <Button size="sm" className="flex items-center gap-1">
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
                <Card key={group.id} className="hover:shadow-md transition-shadow">
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