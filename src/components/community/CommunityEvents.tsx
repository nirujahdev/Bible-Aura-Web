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
  BookOpen
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface Event {
  id: string
  title: string
  description: string
  host: {
    name: string
    avatar: string
  }
  date: string
  time: string
  location: string
  isOnline: boolean
  streamLink?: string
  type: string
  relatedVerse?: string
  attendeeCount: number
  maxAttendees?: number
  isRSVPed: boolean
  tags: string[]
  banner?: string
}

const CommunityEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Online Bible Study: Book of Romans',
      description: 'Join us for an in-depth study of Paul\'s letter to the Romans. We\'ll explore themes of salvation, grace, and Christian living.',
      host: {
        name: 'Pastor David',
        avatar: '/placeholder.svg'
      },
      date: '2024-02-15',
      time: '7:00 PM EST',
      location: 'Online',
      isOnline: true,
      streamLink: 'https://meet.example.com/romans-study',
      type: 'Bible Study',
      relatedVerse: 'Romans 1:16',
      attendeeCount: 47,
      maxAttendees: 100,
      isRSVPed: true,
      tags: ['Bible Study', 'Romans', 'Online'],
      banner: '/placeholder.svg'
    },
    {
      id: '2',
      title: 'Youth Prayer Night',
      description: 'A powerful time of worship and prayer for our youth. Come expecting God to move!',
      host: {
        name: 'Youth Pastor Sarah',
        avatar: '/placeholder.svg'
      },
      date: '2024-02-18',
      time: '6:30 PM EST',
      location: 'Grace Community Church, Main Sanctuary',
      isOnline: false,
      type: 'Prayer Night',
      relatedVerse: 'Matthew 18:20',
      attendeeCount: 23,
      maxAttendees: 50,
      isRSVPed: false,
      tags: ['Youth', 'Prayer', 'Worship'],
      banner: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Women\'s Bible Study Brunch',
      description: 'Ladies, join us for fellowship, food, and a study on Proverbs 31. Childcare provided.',
      host: {
        name: 'Linda Johnson',
        avatar: '/placeholder.svg'
      },
      date: '2024-02-20',
      time: '10:00 AM EST',
      location: 'Community Center, Room 201',
      isOnline: false,
      type: 'Bible Study',
      relatedVerse: 'Proverbs 31:10',
      attendeeCount: 15,
      maxAttendees: 25,
      isRSVPed: false,
      tags: ['Women', 'Bible Study', 'Fellowship'],
      banner: '/placeholder.svg'
    }
  ])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'upcoming' | 'calendar'>('upcoming')
  const [filterType, setFilterType] = useState('all')
  const [showCreateEvent, setShowCreateEvent] = useState(false)

  const handleRSVP = (eventId: string, isRSVP: boolean) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isRSVPed: isRSVP,
              attendeeCount: isRSVP ? event.attendeeCount + 1 : event.attendeeCount - 1
            }
          : event
      )
    )
  }

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'bible-study', label: 'Bible Study' },
    { value: 'prayer', label: 'Prayer Night' },
    { value: 'worship', label: 'Worship' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'fellowship', label: 'Fellowship' },
    { value: 'outreach', label: 'Outreach' }
  ]

  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date())
  const pastEvents = events.filter(event => new Date(event.date) < new Date())

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
                  <input type="checkbox" id="online-event" className="rounded" />
                  <Label htmlFor="online-event">This is an online event</Label>
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

      {viewMode === 'upcoming' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Events List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold">Upcoming Events</h3>
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
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
                    {event.isOnline && (
                      <Badge className="bg-blue-500">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
                  </div>

                  {/* Event Title */}
                  <h4 className="text-xl font-semibold mb-3">{event.title}</h4>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
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
                  <p className="text-gray-700 mb-4">{event.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {event.isRSVPed ? (
                        <Button 
                          variant="outline" 
                          onClick={() => handleRSVP(event.id, false)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          RSVP'd
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRSVP(event.id, true)}
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          RSVP
                        </Button>
                      )}
                      {event.isOnline && event.streamLink && (
                        <Button variant="outline" className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          Join Stream
                        </Button>
                      )}
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
                  {events.filter(e => e.isRSVPed).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
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
                  ))}
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
                    <Badge variant="outline">3 events</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Online Events</span>
                    <Badge variant="secondary">8 events</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
          <p className="text-gray-600">
            Calendar view with integrated events coming soon!
          </p>
        </div>
      )}
    </div>
  )
}

export default CommunityEvents 