import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, Plus, Edit3, Trash2, Search, Calendar, 
  CheckCircle, Clock, Users, Lock, Star 
} from "lucide-react";

interface PrayerRequest {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  is_private: boolean | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
}

const Prayers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [showPrayerDialog, setShowPrayerDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [isPrivate, setIsPrivate] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const statuses = [
    { value: "active", label: "🙏 Active", color: "bg-blue-100 text-blue-800" },
    { value: "answered", label: "✅ Answered", color: "bg-green-100 text-green-800" },
    { value: "ongoing", label: "⏳ Ongoing", color: "bg-yellow-100 text-yellow-800" },
    { value: "closed", label: "📋 Closed", color: "bg-gray-100 text-gray-800" }
  ];

  const prayerCategories = [
    "Family", "Health", "Work", "Relationships", "Guidance", "Provision",
    "Protection", "Salvation", "Healing", "Peace", "Wisdom", "Strength",
    "Church", "Community", "Missions", "Leadership", "Financial", "Spiritual Growth"
  ];

  useEffect(() => {
    if (user) {
      loadPrayers();
    }
  }, [user]);

  const loadPrayers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prayer requests",
        variant: "destructive"
      });
    }
  };

  const savePrayer = async () => {
    if (!user || !title.trim()) return;

    setLoading(true);
    try {
      const prayerData = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        status,
        is_private: isPrivate,
        answered_at: status === 'answered' ? new Date().toISOString() : null
      };

      if (selectedPrayer) {
        const { error } = await supabase
          .from('prayer_requests')
          .update(prayerData)
          .eq('id', selectedPrayer.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Prayer request updated successfully" });
      } else {
        const { error } = await supabase
          .from('prayer_requests')
          .insert(prayerData);
        
        if (error) throw error;
        toast({ title: "Success", description: "Prayer request created successfully" });
      }

      await loadPrayers();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prayer request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePrayer = async (prayerId: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', prayerId);

      if (error) throw error;
      
      await loadPrayers();
      toast({ title: "Success", description: "Prayer request deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete prayer request",
        variant: "destructive"
      });
    }
  };

  const markAsAnswered = async (prayerId: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ 
          status: 'answered',
          answered_at: new Date().toISOString()
        })
        .eq('id', prayerId);

      if (error) throw error;
      
      await loadPrayers();
      toast({ title: "Praise God!", description: "Prayer marked as answered" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update prayer request",
        variant: "destructive"
      });
    }
  };

  const editPrayer = (prayer: PrayerRequest) => {
    setSelectedPrayer(prayer);
    setTitle(prayer.title);
    setDescription(prayer.description || "");
    setStatus(prayer.status || "active");
    setIsPrivate(prayer.is_private ?? true);
    setShowPrayerDialog(true);
  };

  const resetForm = () => {
    setSelectedPrayer(null);
    setTitle("");
    setDescription("");
    setStatus("active");
    setIsPrivate(true);
    setShowPrayerDialog(false);
  };

  const getStatusDisplay = (statusValue: string | null) => {
    const statusObj = statuses.find(s => s.value === statusValue);
    return statusObj ? (
      <Badge className={statusObj.color}>
        {statusObj.label}
      </Badge>
    ) : null;
  };

  const filteredPrayers = prayers.filter(prayer => {
    const matchesSearch = prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prayer.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || prayer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const prayerStats = {
    total: prayers.length,
    active: prayers.filter(p => p.status === 'active').length,
    answered: prayers.filter(p => p.status === 'answered').length,
    ongoing: prayers.filter(p => p.status === 'ongoing').length
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-muted-foreground">
              Please sign in to access your prayer requests.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-aura-gradient text-white p-4 border-b flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6" />
            <h1 className="text-2xl font-divine">Prayer Requests</h1>
            <Star className="h-5 w-5" />
          </div>
          <p className="text-white/80 mt-1">Keep track of your prayers and see God's faithfulness</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              {/* Empty div for layout structure */}
            </div>
            
            <Dialog open={showPrayerDialog} onOpenChange={setShowPrayerDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Prayer Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedPrayer ? "Edit Prayer Request" : "New Prayer Request"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Prayer Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What would you like to pray about?"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share more details about your prayer request..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((statusOption) => (
                          <SelectItem key={statusOption.value} value={statusOption.value}>
                            {statusOption.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      id="private"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                    <label htmlFor="private" className="text-sm font-medium">
                      Keep private
                    </label>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={savePrayer} disabled={!title.trim() || loading}>
                    {selectedPrayer ? "Update Prayer" : "Save Prayer"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{prayerStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Prayers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{prayerStats.active}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{prayerStats.answered}</div>
              <div className="text-sm text-muted-foreground">Answered</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{prayerStats.ongoing}</div>
              <div className="text-sm text-muted-foreground">Ongoing</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prayer requests..."
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prayers</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Requests */}
        <div className="grid gap-6">
          {filteredPrayers.length > 0 ? (
            filteredPrayers.map((prayer) => (
              <Card key={prayer.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(prayer.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        {prayer.is_private && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      <CardTitle className="text-xl">{prayer.title}</CardTitle>
                      
                      <div className="flex flex-wrap gap-2">
                        {prayer.status && getStatusDisplay(prayer.status)}
                        {prayer.answered_at && (
                          <Badge className="bg-green-100 text-green-800">
                            Answered {new Date(prayer.answered_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {prayer.status !== 'answered' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsAnswered(prayer.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editPrayer(prayer)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePrayer(prayer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {prayer.description && (
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {prayer.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery || filterStatus !== "all" ? "No prayers found" : "Start Your Prayer Journey"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Begin tracking your prayer requests and witness God's faithfulness."
                  }
                </p>
                <Button onClick={() => setShowPrayerDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Prayer Request
                </Button>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prayers;