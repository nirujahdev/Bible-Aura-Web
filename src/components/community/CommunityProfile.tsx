import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  User, 
  Settings,
  Camera,
  Heart,
  MessageSquare,
  Users,
  Calendar,
  Award,
  Bell,
  Shield,
  Link,
  BookOpen,
  Star,
  Trophy
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Switch } from '../ui/switch'

interface UserProfile {
  id: string
  name: string
  avatar: string
  banner: string
  bio: string
  favoriteVerse: {
    reference: string
    text: string
  }
  joinDate: string
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedDate: string
  }>
  stats: {
    posts: number
    prayers: number
    groupsJoined: number
    eventsAttended: number
    helpfulVotes: number
  }
}

interface Activity {
  id: string
  type: 'post' | 'prayer' | 'group' | 'event' | 'comment'
  title: string
  description: string
  timestamp: string
  relatedGroup?: string
  verse?: string
}

const CommunityProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'John Smith',
    avatar: '/placeholder.svg',
    banner: '/placeholder.svg',
    bio: 'Passionate about studying God\'s Word and connecting with fellow believers. Love discussing theology and sharing testimonies of God\'s faithfulness.',
    favoriteVerse: {
      reference: 'Jeremiah 29:11',
      text: 'For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future.'
    },
    joinDate: '2023-01-15',
    badges: [
      {
        id: '1',
        name: 'Helper',
        description: 'Helped 50+ community members with thoughtful responses',
        icon: '🤝',
        earnedDate: '2023-06-15'
      },
      {
        id: '2',
        name: 'Encourager',
        description: 'Provided encouragement to 100+ prayer requests',
        icon: '💝',
        earnedDate: '2023-08-20'
      },
      {
        id: '3',
        name: 'Scholar',
        description: 'Posted 25+ insightful Bible study discussions',
        icon: '📚',
        earnedDate: '2023-11-10'
      },
      {
        id: '4',
        name: 'Faithful Friend',
        description: 'Active community member for over 1 year',
        icon: '⭐',
        earnedDate: '2024-01-15'
      }
    ],
    stats: {
      posts: 127,
      prayers: 89,
      groupsJoined: 8,
      eventsAttended: 23,
      helpfulVotes: 234
    }
  })

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'post',
      title: 'Started a discussion about faith and works',
      description: 'Exploring the relationship between faith and works in James 2',
      timestamp: '2 hours ago',
      verse: 'James 2:14-26'
    },
    {
      id: '2',
      type: 'prayer',
      title: 'Prayed for Sarah M.\'s healing request',
      description: 'Joined 47 others in prayer for healing',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      type: 'group',
      title: 'Joined Bible in a Year group',
      description: 'Now reading through Genesis with 2,847 other members',
      timestamp: '1 day ago',
      relatedGroup: 'Bible in a Year'
    },
    {
      id: '4',
      type: 'event',
      title: 'RSVP\'d to Online Bible Study',
      description: 'Will attend Romans study this Friday evening',
      timestamp: '2 days ago'
    }
  ])

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="h-4 w-4" />
      case 'prayer': return <Heart className="h-4 w-4" />
      case 'group': return <Users className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-600'
      case 'prayer': return 'text-red-500'
      case 'group': return 'text-green-600'
      case 'event': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="relative">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/30"
            >
              <Camera className="h-4 w-4 mr-2" />
              Change Banner
            </Button>
          </div>
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-2xl">{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-20 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Community Member
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{userProfile.bio}</p>
              
              {/* Favorite Verse */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">
                    Favorite Verse: {userProfile.favoriteVerse.reference}
                  </span>
                </div>
                <p className="text-blue-700 dark:text-blue-300 italic">
                  "{userProfile.favoriteVerse.text}"
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Member since {new Date(userProfile.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profile-name">Name</Label>
                      <Input id="profile-name" defaultValue={userProfile.name} />
                    </div>
                    <div>
                      <Label htmlFor="profile-bio">Bio</Label>
                      <Textarea 
                        id="profile-bio" 
                        defaultValue={userProfile.bio} 
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="favorite-verse">Favorite Bible Verse</Label>
                      <Input 
                        id="favorite-verse" 
                        defaultValue={userProfile.favoriteVerse.reference}
                        placeholder="e.g., John 3:16"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setShowEditProfile(false)}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userProfile.stats.posts}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userProfile.stats.prayers}</div>
            <div className="text-sm text-gray-600">Prayers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userProfile.stats.groupsJoined}</div>
            <div className="text-sm text-gray-600">Groups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userProfile.stats.eventsAttended}</div>
            <div className="text-sm text-gray-600">Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{userProfile.stats.helpfulVotes}</div>
            <div className="text-sm text-gray-600">Helpful Votes</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="prayers">Prayers</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.description}</div>
                          {activity.verse && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {activity.verse}
                            </Badge>
                          )}
                          {activity.relatedGroup && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {activity.relatedGroup}
                            </Badge>
                          )}
                          <div className="text-xs text-gray-500 mt-1">{activity.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badges & Achievements */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Badges & Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {userProfile.badges.map(badge => (
                      <div key={badge.id} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-gray-500">{badge.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Earned {new Date(badge.earnedDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Helpful Votes Received</span>
                      <Badge variant="outline">{userProfile.stats.helpfulVotes}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Community Rank</span>
                      <Badge>Top 15%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Consecutive Days Active</span>
                      <Badge variant="secondary">47 days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Discussion Posts</h3>
              <p className="text-gray-600">
                Your posts and discussions will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prayers" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Prayer Activity</h3>
              <p className="text-gray-600">
                Prayer requests and prayers you've offered will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Groups</h3>
              <p className="text-gray-600">
                Groups you've joined and created will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Discussion Replies</div>
                    <div className="text-sm text-gray-600">Get notified when someone replies to your discussions</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Prayer Request Updates</div>
                    <div className="text-sm text-gray-600">Get notified about prayers and answers</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Group Activity</div>
                    <div className="text-sm text-gray-600">Get notified about activity in your groups</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Event Reminders</div>
                    <div className="text-sm text-gray-600">Get reminded about upcoming events you've RSVP'd to</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Public Profile</div>
                    <div className="text-sm text-gray-600">Allow others to view your profile</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show Activity</div>
                    <div className="text-sm text-gray-600">Show your activity in public feeds</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Allow Direct Messages</div>
                    <div className="text-sm text-gray-600">Allow other community members to message you</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show Favorite Verse</div>
                    <div className="text-sm text-gray-600">Display your favorite verse on your profile</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CommunityProfile 