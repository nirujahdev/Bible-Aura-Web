import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  Heart, 
  Plus,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Users,
  MessageSquare
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface PrayerRequest {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
  }
  category: string
  urgency: 'normal' | 'urgent'
  prayerCount: number
  isAnswered: boolean
  testimony?: string
  timeAgo: string
  isAnonymous: boolean
}

const CommunityPrayerRequests: React.FC = () => {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([
    {
      id: '1',
      title: 'Healing for My Mother',
      content: 'Please pray for my mother who was just diagnosed with cancer. We trust in God\'s healing power and ask for your prayers during this difficult time.',
      author: {
        name: 'Anonymous',
        avatar: '/placeholder.svg'
      },
      category: 'Healing',
      urgency: 'urgent',
      prayerCount: 47,
      isAnswered: false,
      timeAgo: '3 hours ago',
      isAnonymous: true
    },
    {
      id: '2',
      title: 'Job Interview Tomorrow',
      content: 'I have an important job interview tomorrow that could change my family\'s situation. Please pray for God\'s favor and wisdom.',
      author: {
        name: 'Michael R.',
        avatar: '/placeholder.svg'
      },
      category: 'Guidance',
      urgency: 'normal',
      prayerCount: 23,
      isAnswered: false,
      timeAgo: '6 hours ago',
      isAnonymous: false
    },
    {
      id: '3',
      title: 'Safe Delivery - ANSWERED!',
      content: 'Thank you all for praying! Our baby girl was born healthy and safe. God is good!',
      author: {
        name: 'Sarah & Tom',
        avatar: '/placeholder.svg'
      },
      category: 'Family',
      urgency: 'normal',
      prayerCount: 89,
      isAnswered: true,
      testimony: 'God answered our prayers beautifully! Baby Emma arrived at 7lbs 2oz and is perfectly healthy. We are so grateful for everyone who prayed with us during this journey.',
      timeAgo: '1 day ago',
      isAnonymous: false
    }
  ])

  const [filter, setFilter] = useState('latest')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showNewRequest, setShowNewRequest] = useState(false)

  const handlePrayerCount = (id: string) => {
    setPrayerRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, prayerCount: request.prayerCount + 1 }
          : request
      )
    )
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'healing', label: 'Healing' },
    { value: 'family', label: 'Family' },
    { value: 'guidance', label: 'Guidance' },
    { value: 'thanksgiving', label: 'Thanksgiving' },
    { value: 'financial', label: 'Financial' },
    { value: 'relationships', label: 'Relationships' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Filters & Submit */}
      <div className="lg:col-span-1 space-y-6">
        {/* Submit Prayer Request */}
        <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Submit Prayer Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit a Prayer Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prayer-title">Title</Label>
                <Input id="prayer-title" placeholder="Brief description of your prayer need" />
              </div>
              <div>
                <Label htmlFor="prayer-category">Category</Label>
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
                <Label htmlFor="prayer-content">Prayer Request Details</Label>
                <Textarea 
                  id="prayer-content" 
                  placeholder="Share more details about your prayer need..." 
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="urgent" className="rounded" />
                <Label htmlFor="urgent">Mark as urgent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="anonymous" className="rounded" />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowNewRequest(false)}>
                  Submit Prayer Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
              <Label>Sort by</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="urgent">Urgent First</SelectItem>
                  <SelectItem value="most-prayed">Most Prayed</SelectItem>
                  <SelectItem value="answered">Answered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* Prayer Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Prayer Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Requests</span>
                <Badge>234</Badge>
              </div>
              <div className="flex justify-between">
                <span>Prayers Offered</span>
                <Badge>1,567</Badge>
              </div>
              <div className="flex justify-between">
                <span>Answered This Week</span>
                <Badge variant="outline">23</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Prayer Requests */}
      <div className="lg:col-span-3">
        <div className="space-y-4">
          {prayerRequests.map((request) => (
            <Card key={request.id} className={`hover:shadow-md transition-shadow ${request.urgency === 'urgent' ? 'border-red-200 bg-red-50/30' : ''}`}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.author.avatar} />
                      <AvatarFallback>
                        {request.isAnonymous ? '?' : request.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.isAnonymous ? 'Anonymous' : request.author.name}
                      </div>
                      <div className="text-sm text-gray-500">{request.timeAgo}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={request.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                      {request.category}
                    </Badge>
                    {request.urgency === 'urgent' && (
                      <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                    {request.isAnswered && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Answered
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Title & Content */}
                <h3 className="text-xl font-semibold mb-3">{request.title}</h3>
                <p className="text-gray-700 mb-4">{request.content}</p>

                {/* Testimony (if answered) */}
                {request.isAnswered && request.testimony && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4 border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-300">
                        Testimony
                      </span>
                    </div>
                    <p className="text-green-700 dark:text-green-300">
                      {request.testimony}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handlePrayerCount(request.id)}
                    >
                      <Heart className="h-4 w-4" />
                      I'm Praying ({request.prayerCount})
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Encourage
                    </Button>
                  </div>
                  {!request.isAnswered && (
                    <Button variant="outline" size="sm">
                      Mark as Answered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Requests</Button>
        </div>
      </div>
    </div>
  )
}

export default CommunityPrayerRequests 