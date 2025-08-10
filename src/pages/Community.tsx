import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  User, 
  Heart,
  Search,
  Filter,
  Plus,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import CommunityDiscussions from '../components/community/CommunityDiscussions'
import CommunityPrayerRequests from '../components/community/CommunityPrayerRequests'
import CommunityGroups from '../components/community/CommunityGroups'
import CommunityEvents from '../components/community/CommunityEvents'
import CommunityProfile from '../components/community/CommunityProfile'

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discussions')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Bible Aura Community
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Connect with fellow believers, share insights, pray together, and grow in faith through 
            meaningful discussions and fellowship.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-slate-600">Discussions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">892</div>
              <div className="text-sm text-slate-600">Prayers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">156</div>
              <div className="text-sm text-slate-600">Groups</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">43</div>
              <div className="text-sm text-slate-600">Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="prayer" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Prayer Requests
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6">
            <CommunityDiscussions />
          </TabsContent>

          <TabsContent value="prayer" className="space-y-6">
            <CommunityPrayerRequests />
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <CommunityGroups />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <CommunityEvents />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <CommunityProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Community 