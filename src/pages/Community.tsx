import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { MobileOptimizedLayout } from '@/components/MobileOptimizedLayout'
import { useAuth } from '@/hooks/useAuth'
import CommunityDiscussions from '@/components/community/CommunityDiscussions'
import CommunityPrayerRequests from '@/components/community/CommunityPrayerRequests'
import CommunityGroups from '@/components/community/CommunityGroups'
import CommunityEvents from '@/components/community/CommunityEvents'
import CommunityProfile from '@/components/community/CommunityProfile'

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState('discussions')
  const { user } = useAuth()

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">

        {/* Top Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 mb-6">
            <TabsList className="grid w-full grid-cols-5 h-auto bg-transparent">
              <TabsTrigger 
                value="discussions" 
                className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-700 px-6 py-3 rounded-none"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger 
                value="prayer" 
                className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-b-2 data-[state=active]:border-red-700 px-6 py-3 rounded-none"
              >
                <Heart className="h-4 w-4 mr-2" />
                Prayer Requests
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:border-green-700 px-6 py-3 rounded-none"
              >
                <Users className="h-4 w-4 mr-2" />
                Groups
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:border-b-2 data-[state=active]:border-purple-700 px-6 py-3 rounded-none"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-gray-700 px-6 py-3 rounded-none"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

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
    </MobileOptimizedLayout>
  )
}

export default Community 