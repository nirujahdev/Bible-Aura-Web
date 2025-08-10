import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Calendar } from '../ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Plus,
  MapPin,
  Clock,
  Users,
  Video,
  CheckCircle,
  X,
  Search,
  Filter,
  Play,
  BookOpen,
  ExternalLink,
  Share,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  ArrowLeft,
  Bell,
  Heart,
  MessageSquare,
  Globe,
  Lock,
  Zap,
  Star,
  Settings,
  Download,
  Smartphone,
  Monitor,
  Headphones
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Switch } from '../ui/switch'
import { Progress } from '../ui/progress'

interface Event {
  id: string
  title: string
  description: string
  host: {
    name: string
    avatar: string
    id: string
  }
  date: string
  time: string
  endTime?: string
  location: string
  isOnline: boolean
  streamLink?: string
  meetingLink?: string
  type: string
  relatedVerse?: string
  verseText?: string
  attendeeCount: number
  maxAttendees?: number
  isRSVPed: boolean
  rsvpStatus?: 'going' | 'maybe' | 'not_going'
  tags: string[]
  banner?: string
  isRecurring?: boolean
  recurrencePattern?: string
  registrationRequired?: boolean
  price?: number
  timezone?: string
  agenda?: Array<{
    time: string
    item: string
  }>
  materials?: Array<{
    name: string
    url: string
    type: 'pdf' | 'video' | 'audio' | 'link'
  }>
  attendees: Array<{
    id: string
    name: string
    avatar: string
    status: 'going' | 'maybe' | 'not_going'
  }>
  comments: Array<{
    id: string
    author: {
      name: string
      avatar: string
      id: string
    }
    content: string
    timestamp: string
    likes: number
    isLiked: boolean
  }>
  isLiked: boolean
  likes: number
  shares: number
}

const CommunityEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Online Bible Study: Book of Romans',
      description: 'Join us for an in-depth study of Paul\'s letter to the Romans. We\'ll explore themes of salvation, grace, and Christian living. This 8-week series will take us through the entire book with practical applications for daily life.',
      host: {
        name: 'Pastor David',
        avatar: '/placeholder.svg',
        id: 'host1'
      },
      date: '2024-02-15',
      time: '7:00 PM',
      endTime: '8:30 PM',
      location: 'Online',
      isOnline: true,
      streamLink: 'https://meet.example.com/romans-study',
      meetingLink: 'https://zoom.us/j/123456789',
      type: 'Bible Study',
      relatedVerse: 'Romans 1:16',
      verseText: 'For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile.',
      attendeeCount: 47,
      maxAttendees: 100,
      isRSVPed: true,
      rsvpStatus: 'going',
      tags: ['Bible Study', 'Romans', 'Online', 'Weekly'],
      banner: '/placeholder.svg',
      isRecurring: true,
      recurrencePattern: 'Weekly on Thursdays',
      registrationRequired: true,
      timezone: 'EST',
      agenda: [
        { time: '7:00 PM', item: 'Opening Prayer & Welcome' },
        { time: '7:10 PM', item: 'Review Previous Week' },
        { time: '7:20 PM', item: 'Romans Chapter Study' },
        { time: '8:00 PM', item: 'Discussion & Questions' },
        { time: '8:25 PM', item: 'Closing Prayer' }
      ],
      materials: [
        { name: 'Romans Study Guide', url: '#', type: 'pdf' },
        { name: 'Previous Session Recording', url: '#', type: 'video' },
        { name: 'Background Audio', url: '#', type: 'audio' }
      ],
      attendees: [
        { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg', status: 'going' },
        { id: '2', name: 'Mike Chen', avatar: '/placeholder.svg', status: 'going' },
        { id: '3', name: 'Lisa Park', avatar: '/placeholder.svg', status: 'maybe' }
      ],
      comments: [
        {
          id: 'c1',
          author: { name: 'Sarah Johnson', avatar: '/placeholder.svg', id: 'u1' },
          content: 'Really looking forward to this! Romans is such a powerful book.',
          timestamp: '2 hours ago',
          likes: 5,
          isLiked: false
        }
      ],
      isLiked: true,
      likes: 12,
      shares: 3
    },
    {
      id: '2',
      title: 'Youth Prayer Night',
      description: 'A powerful time of worship and prayer for our youth. Come expecting God to move! We\'ll have live music, testimonies, and focused prayer time.',
      host: {
        name: 'Youth Pastor Sarah',
        avatar: '/placeholder.svg',
        id: 'host2'
      },
      date: '2024-02-18',
      time: '6:30 PM',
      endTime: '8:00 PM',
      location: 'Grace Community Church, Main Sanctuary',
      isOnline: false,
      type: 'Prayer Night',
      relatedVerse: 'Matthew 18:20',
      verseText: 'For where two or three gather in my name, there am I with them.',
      attendeeCount: 23,
      maxAttendees: 50,
      isRSVPed: false,
      tags: ['Youth', 'Prayer', 'Worship', 'In-Person'],
      banner: '/placeholder.svg',
      registrationRequired: false,
      attendees: [],
      comments: [],
      isLiked: false,
      likes: 8,
      shares: 2
    },
    {
      id: '3',
      title: 'Women\'s Bible Study Brunch',
      description: 'Ladies, join us for fellowship, food, and a study on Proverbs 31. Childcare provided. We\'ll explore what it means to be a woman of virtue in today\'s world.',
      host: {
        name: 'Linda Johnson',
        avatar: '/placeholder.svg',
        id: 'host3'
      },
      date: '2024-02-20',
      time: '10:00 AM',
      endTime: '12:00 PM',
      location: 'Community Center, Room 201',
      isOnline: false,
      type: 'Bible Study',
      relatedVerse: 'Proverbs 31:10',
      verseText: 'A wife of noble character who can find? She is worth far more than rubies.',
      attendeeCount: 15,
      maxAttendees: 25,
      isRSVPed: false,
      tags: ['Women', 'Bible Study', 'Fellowship', 'Food'],
      banner: '/placeholder.svg',
      registrationRequired: true,
      price: 15,
      attendees: [],
      comments: [],
      isLiked: false,
      likes: 6,
      shares: 4
    }
  ])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'upcoming' | 'calendar' | 'past'>('upcoming')
  const [filterType, setFilterType] = useState('all')
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventActiveTab, setEventActiveTab] = useState('details')
  const [newComment, setNewComment] = useState('')

  const handleRSVP = (eventId: string, status: 'going' | 'maybe' | 'not_going') => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isRSVPed: status === 'going' || status === 'maybe',
              rsvpStatus: status,
              attendeeCount: status === 'going' 
                ? (event.rsvpStatus === 'going' ? event.attendeeCount : event.attendeeCount + 1)
                : (event.rsvpStatus === 'going' ? event.attendeeCount - 1 : event.attendeeCount)
            }
          : event
      )
    )
  }

  const handleLikeEvent = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              isLiked: !event.isLiked,
              likes: event.isLiked ? event.likes - 1 : event.likes + 1
            }
          : event
      )
    )
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedEvent) return
    
    const comment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        avatar: '/placeholder.svg',
        id: 'current-user'
      },
      content: newComment,
      timestamp: 'just now',
      likes: 0,
      isLiked: false
    }

    setEvents(prev =>
      prev.map(event =>
        event.id === selectedEvent.id
          ? { ...event, comments: [comment, ...event.comments] }
          : event
      )
    )

    setSelectedEvent(prev => prev ? { ...prev, comments: [comment, ...prev.comments] } : null)
    setNewComment('')
  }

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'bible-study', label: 'Bible Study' },
    { value: 'prayer', label: 'Prayer Night' },
    { value: 'worship', label: 'Worship' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'outreach', label: 'Outreach' },
    { value: 'conference', label: 'Conference' }
  ]

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date())
  const pastEvents = events.filter(event => new Date(event.date) < new Date())
  const myEvents = events.filter(event => event.isRSVPed)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'bg-green-500'
      case 'maybe': return 'bg-yellow-500'
      case 'not_going': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <BookOpen className="h-4 w-4" />
      case 'video': return <Play className="h-4 w-4" />
      case 'audio': return <Headphones className="h-4 w-4" />
      default: return <ExternalLink className="h-4 w-4" />
    }
  }

  if (selectedEvent) {
    return (
      <div className="space-y-6">
        {/* Event Header */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-800 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-4 left-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => setSelectedEvent(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {selectedEvent.type}
                    </Badge>
                    {selectedEvent.isOnline ? (
                      <Badge variant="secondary" className="bg-blue-500/80 text-white">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/80 text-white">
                        <MapPin className="h-3 w-3 mr-1" />
                        In-Person
                      </Badge>
                    )}
                    {selectedEvent.isRecurring && (
                      <Badge variant="secondary" className="bg-purple-500/80 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-3">{selectedEvent.title}</h1>
                  <div className="flex items-center gap-6 text-white/90">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedEvent.time} - {selectedEvent.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{selectedEvent.attendeeCount} attending</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => handleLikeEvent(selectedEvent.id)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${selectedEvent.isLiked ? 'fill-current text-red-400' : ''}`} />
                    {selectedEvent.likes}
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Add to Calendar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedEvent.attendeeCount}</div>
                  <div className="text-sm text-gray-500">Going</div>
                </div>
                {selectedEvent.maxAttendees && (
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity</span>
                      <span>{selectedEvent.attendeeCount}/{selectedEvent.maxAttendees}</span>
                    </div>
                    <Progress 
                      value={(selectedEvent.attendeeCount / selectedEvent.maxAttendees) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedEvent.rsvpStatus === 'going' ? 'default' : 'outline'}
                  onClick={() => handleRSVP(selectedEvent.id, 'going')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Going
                </Button>
                <Button
                  variant={selectedEvent.rsvpStatus === 'maybe' ? 'default' : 'outline'}
                  onClick={() => handleRSVP(selectedEvent.id, 'maybe')}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Maybe
                </Button>
                <Button
                  variant={selectedEvent.rsvpStatus === 'not_going' ? 'default' : 'outline'}
                  onClick={() => handleRSVP(selectedEvent.id, 'not_going')}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Can't Go
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Navigation */}
        <Tabs value={eventActiveTab} onValueChange={setEventActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{selectedEvent.description}</p>
                  </CardContent>
                </Card>

                {/* Related Verse */}
                {selectedEvent.relatedVerse && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Featured Scripture
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          {selectedEvent.relatedVerse}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          "{selectedEvent.verseText}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Join Links */}
                {selectedEvent.isOnline && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Join Online</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedEvent.streamLink && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">Live Stream</div>
                              <div className="text-sm text-gray-500">Main presentation</div>
                            </div>
                          </div>
                          <Button size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Stream
                          </Button>
                        </div>
                      )}
                      {selectedEvent.meetingLink && (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium">Discussion Room</div>
                              <div className="text-sm text-gray-500">Interactive participation</div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{selectedEvent.time} - {selectedEvent.endTime}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{selectedEvent.location}</div>
                          {selectedEvent.timezone && (
                            <div className="text-sm text-gray-500">{selectedEvent.timezone}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{selectedEvent.attendeeCount} attending</div>
                          {selectedEvent.maxAttendees && (
                            <div className="text-sm text-gray-500">Max {selectedEvent.maxAttendees} people</div>
                          )}
                        </div>
                      </div>
                      {selectedEvent.price && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">${selectedEvent.price}</div>
                            <div className="text-sm text-gray-500">Registration fee</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Host Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Host</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedEvent.host.avatar} />
                        <AvatarFallback>{selectedEvent.host.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{selectedEvent.host.name}</div>
                        <div className="text-sm text-gray-500">Event Organizer</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="h-4 w-4 mr-2" />
                      Invite Friends
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agenda Tab */}
          <TabsContent value="agenda" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent.agenda ? (
                  <div className="space-y-4">
                    {selectedEvent.agenda.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-20 text-sm font-medium text-gray-600">
                          {item.time}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.item}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">No agenda available</h3>
                    <p className="text-sm">The event schedule will be updated soon.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendees Tab */}
          <TabsContent value="attendees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Who's Going ({selectedEvent.attendeeCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent.attendees.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvent.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={attendee.avatar} />
                            <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{attendee.name}</div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(attendee.status)}`} />
                              <span className="text-sm text-gray-500 capitalize">{attendee.status}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">No attendees yet</h3>
                    <p className="text-sm">Be the first to RSVP for this event!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discussion Tab */}
          <TabsContent value="discussion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Add Comment */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Share your thoughts about this event..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                <div className="space-y-4">
                  {selectedEvent.comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={comment.author.avatar} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{comment.author.name}</span>
                              <span className="text-sm text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{comment.content}</p>
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current text-red-600' : ''}`} />
                                {comment.likes}
                              </Button>
                              <Button variant="ghost" size="sm">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Comments</span>
                      <Badge>{selectedEvent.comments.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Likes</span>
                      <Badge variant="outline">{selectedEvent.likes}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Shares</span>
                      <Badge variant="secondary">{selectedEvent.shares}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Materials</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent.materials ? (
                  <div className="space-y-4">
                    {selectedEvent.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {getFileIcon(material.type)}
                          <div>
                            <div className="font-medium">{material.name}</div>
                            <div className="text-sm text-gray-500 capitalize">{material.type}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">No materials available</h3>
                    <p className="text-sm">Event materials will be shared closer to the event date.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Community Events</h2>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setViewMode('upcoming')}
          >
            Upcoming
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button 
            variant={viewMode === 'past' ? 'default' : 'outline'}
            onClick={() => setViewMode('past')}
          >
            Past Events
          </Button>
          <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create a New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input id="event-title" placeholder="Enter event title" />
                </div>
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.slice(1).map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input id="event-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="event-time">Time</Label>
                    <Input id="event-time" type="time" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input id="event-location" placeholder="Enter location or 'Online'" />
                </div>
                <div>
                  <Label htmlFor="related-verse">Related Bible Verse (optional)</Label>
                  <Input id="related-verse" placeholder="e.g., John 3:16" />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea 
                    id="event-description" 
                    placeholder="Describe your event..." 
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="max-attendees">Max Attendees (optional)</Label>
                  <Input id="max-attendees" type="number" placeholder="Leave empty for unlimited" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="online-event" />
                  <Label htmlFor="online-event">This is an online event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="recurring-event" />
                  <Label htmlFor="recurring-event">This is a recurring event</Label>
                </div>
                <div>
                  <Label htmlFor="event-tags">Tags</Label>
                  <Input id="event-tags" placeholder="prayer, youth, bible study (comma separated)" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateEvent(false)}>
                    Create Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Events List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Upcoming Events</h3>
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}>
                <CardContent className="p-6">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={event.host.avatar} />
                        <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Hosted by {event.host.name}</div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isOnline ? (
                        <Badge className="bg-blue-500">
                          <Video className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          In-Person
                        </Badge>
                      )}
                      {event.price && (
                        <Badge variant="secondary">
                          ${event.price}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Event Title */}
                  <h4 className="text-xl font-semibold mb-3">{event.title}</h4>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                      {event.endTime && <span>- {event.endTime}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendeeCount} attending
                        {event.maxAttendees && ` / ${event.maxAttendees} max`}
                      </span>
                    </div>
                  </div>

                  {/* Related Verse */}
                  {event.relatedVerse && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 border-l-4 border-blue-500">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-300">
                          {event.relatedVerse}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {event.tags.length > 3 && (
                      <Badge variant="outline">
                        +{event.tags.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {event.isRSVPed ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRSVP(event.id, 'not_going')
                          }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          RSVP'd
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRSVP(event.id, 'going')
                          }}
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          RSVP
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikeEvent(event.id)
                        }}
                      >
                        <Heart className={`h-4 w-4 ${event.isLiked ? 'fill-current text-red-600' : ''}`} />
                        {event.likes}
                      </Button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days away
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Event Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* My Events */}
            <Card>
              <CardHeader>
                <CardTitle>My Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myEvents.length > 0 ? (
                    myEvents.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                           onClick={() => setSelectedEvent(event)}>
                        <div>
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Event Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <Badge>12 events</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>My RSVPs</span>
                    <Badge variant="outline">{myEvents.length} events</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Online Events</span>
                    <Badge variant="secondary">{events.filter(e => e.isOnline).length} events</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="text-center p-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Full Calendar View</h3>
          <p className="text-gray-600">
            Interactive calendar with integrated events coming soon!
          </p>
        </div>
      )}

      {viewMode === 'past' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Past Events</h3>
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{event.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{event.type}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No past events</h3>
              <p className="text-gray-600">Past events will appear here once you attend some events.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default CommunityEvents 