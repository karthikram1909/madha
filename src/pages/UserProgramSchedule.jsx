import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../components/user-dashboard/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Tv, Play, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isYesterday, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';

// API Configuration
const API_BASE_URL = 'https://secure.madhatv.in/api/v2';
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export default function UserProgramSchedule() {
  const [programs, setPrograms] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'all'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Get user from localStorage
      const userString = localStorage.getItem('user');
      if (userString && userString !== 'undefined') {
        const userObj = JSON.parse(userString);
        setUser(userObj);
        
        // Load programs and user's schedule
        await Promise.all([
          loadPrograms(),
          loadMySchedule(userObj.id)
        ]);
      } else {
        // Load programs without user
        await loadPrograms();
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPrograms = async () => {
    if (IS_LOCAL) {
      // Mock program data for localhost
      console.warn('⚠️ Using mock program data (LOCAL MODE)');
      const mockPrograms = [
        {
          id: '482805',
          title: 'ANDRADA UNAVU',
          schedule_date: format(new Date(), 'yyyy-MM-dd'),
          schedule_time: '18:00:00',
          duration_minutes: 30,
          category: 'devotional',
          description: 'Daily spiritual program',
          status: 'scheduled',
          is_published: true
        },
        {
          id: '482806',
          title: 'Holy Mass',
          schedule_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
          schedule_time: '06:00:00',
          duration_minutes: 60,
          category: 'live_mass',
          description: 'Daily Holy Mass celebration',
          status: 'scheduled',
          is_published: true
        },
        {
          id: '482807',
          title: 'Holy Rosary',
          schedule_date: format(new Date(), 'yyyy-MM-dd'),
          schedule_time: '19:00:00',
          duration_minutes: 30,
          category: 'rosary',
          description: 'Evening rosary prayer',
          status: 'scheduled',
          is_published: true
        }
      ];
      setPrograms(mockPrograms);
      return;
    }

    try {
      // TODO: Replace with actual programs API endpoint when available
      // For now, using mock data even in production since you haven't provided the programs list endpoint
      const response = await fetch(`${API_BASE_URL}/programs/list.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || data || []);
      } else {
        throw new Error('Failed to fetch programs');
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      // Fallback to mock data
      setPrograms([]);
    }
  };

  const loadMySchedule = async (userId) => {
    if (IS_LOCAL) {
      console.warn('⚠️ Skipping my schedule load (LOCAL MODE)');
      setMySchedule([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/my_schedule/get.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch my schedule');
      }

      const data = await response.json();
      
      if (!data.error && data.data && data.data.length > 0) {
        const userSchedule = data.data[0].schedules || [];
        setMySchedule(userSchedule);
      } else {
        setMySchedule([]);
      }
    } catch (error) {
      console.error('Error loading my schedule:', error);
      setMySchedule([]);
    }
  };

  const handleToggleSchedule = async (scheduleId) => {
    if (!user) {
      toast.info("Please log in to add programs to your schedule.");
      return;
    }

    if (IS_LOCAL) {
      toast.info("Schedule feature simulated in local mode");
      return;
    }

    try {
      const isInSchedule = mySchedule.some(s => s.schedule_id === scheduleId);
      
      if (isInSchedule) {
        // TODO: Add remove from schedule API when available
        toast.info("Remove from schedule feature coming soon");
        return;
      }

      // Add to schedule
      const response = await fetch(`${API_BASE_URL}/my_schedule/add.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          schedule_id: scheduleId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to schedule');
      }

      const data = await response.json();
      
      if (!data.error) {
        toast.success("Added to your schedule!");
        await loadMySchedule(user.id);
      } else {
        toast.error(data.message || "Could not add to schedule");
      }
    } catch (error) {
      console.error("Failed to toggle schedule:", error);
      toast.error("Could not update schedule.");
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      live_mass: 'bg-blue-100 text-blue-800 border-blue-200',
      devotional: 'bg-purple-100 text-purple-800 border-purple-200',
      rosary: 'bg-green-100 text-green-800 border-green-200',
      bible_reflection: 'bg-teal-100 text-teal-800 border-teal-200',
      special_event: 'bg-orange-100 text-orange-800 border-orange-200',
      documentary: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getDateLabel = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return format(time, 'h:mm a');
  };

  const getFilteredPrograms = () => {
    let filtered = programs;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (viewMode === 'day') {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(p => p.schedule_date === selectedDateStr);
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);
      filtered = filtered.filter(p => {
        const programDate = parseISO(p.schedule_date);
        return programDate >= weekStart && programDate <= weekEnd;
      });
    }

    return filtered;
  };

  const groupProgramsByDate = (programs) => {
    const grouped = programs.reduce((acc, program) => {
      const date = program.schedule_date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(program);
      return acc;
    }, {});

    // Sort programs within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => (a.schedule_time || "").localeCompare(b.schedule_time || ""));
    });

    return grouped;
  };

  const navigateDate = (direction) => {
    if (viewMode === 'day') {
      setSelectedDate(prev => addDays(prev, direction));
    } else if (viewMode === 'week') {
      setSelectedDate(prev => addDays(prev, direction * 7));
    }
  };

  const filteredPrograms = getFilteredPrograms();
  const programsByDate = groupProgramsByDate(filteredPrograms);
  const sortedDates = Object.keys(programsByDate).sort();

  return (
    <UserDashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">📅 Program Schedule</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">Stay updated with our daily masses, prayers, and spiritual programs</p>
          </div>
          {user && mySchedule.length > 0 && (
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-sm text-slate-600">
                {mySchedule.length} in my schedule
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-3 md:gap-4">
              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-full sm:w-32 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day View</SelectItem>
                    <SelectItem value="week">Week View</SelectItem>
                    <SelectItem value="all">All Programs</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-40 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="live_mass">Holy Mass</SelectItem>
                    <SelectItem value="devotional">Devotional</SelectItem>
                    <SelectItem value="rosary">Rosary</SelectItem>
                    <SelectItem value="bible_reflection">Bible Reflection</SelectItem>
                    <SelectItem value="special_event">Special Event</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Navigation */}
              {(viewMode === 'day' || viewMode === 'week') && (
                <div className="flex items-center gap-2 md:gap-3 justify-center flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => navigateDate(-1)} className="h-8 px-2 md:px-3">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs md:text-sm font-medium min-w-[140px] sm:min-w-[180px] text-center px-2">
                    {viewMode === 'day' 
                      ? format(selectedDate, 'MMM d, yyyy')
                      : `${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`
                    }
                  </span>
                  <Button variant="outline" size="sm" onClick={() => navigateDate(1)} className="h-8 px-2 md:px-3">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="h-8 px-2 md:px-3 text-xs md:text-sm">
                    Today
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8 md:p-12 text-center">
              <p className="text-sm md:text-base text-slate-600">Loading program schedule...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {sortedDates.length > 0 ? (
              sortedDates.map(date => (
                <Card key={date} className="shadow-sm">
                  <CardHeader className="border-b border-slate-100 p-4 md:p-6">
                    <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-bold text-slate-900">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#B71C1C] flex-shrink-0" />
                      <span className="truncate">{getDateLabel(date)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6">
                    <div className="grid gap-3 md:gap-4">
                      {programsByDate[date].map(program => {
                        const isInSchedule = mySchedule.some(s => String(s.schedule_id) === String(program.id));
                        return (
                          <div 
                            key={program.id} 
                            className={`flex flex-col gap-3 p-3 md:p-4 rounded-lg hover:bg-slate-50 transition-colors border-l-4 ${getCategoryColor(program.category)}`}
                          >
                            {/* Time and Duration */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-slate-600 flex-shrink-0">
                                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="font-medium text-sm md:text-base">{formatTime(program.schedule_time)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500">
                                <Tv className="w-3 h-3 md:w-4 md:h-4" />
                                {program.duration_minutes && (
                                  <span>{program.duration_minutes} min</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Title and Badges */}
                            <div className="flex flex-col gap-2">
                              <h3 className="font-semibold text-sm md:text-base text-slate-900 leading-tight">{program.title}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`${getCategoryColor(program.category)} text-[10px] md:text-xs`}>
                                  {program.category?.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {program.status === 'live' && (
                                  <Badge className="bg-red-600 text-white animate-pulse text-[10px] md:text-xs">
                                    <Play className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Description */}
                            {program.description && (
                              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{program.description}</p>
                            )}
                            
                            {/* Add to Schedule Button */}
                            {user && (
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant={isInSchedule ? "default" : "outline"}
                                  onClick={() => handleToggleSchedule(program.id)}
                                  className={isInSchedule ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                                >
                                  <Star className={`w-4 h-4 mr-1 ${isInSchedule ? 'fill-current' : ''}`} />
                                  {isInSchedule ? 'In My Schedule' : 'Add to Schedule'}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 md:p-12 text-center">
                  <Tv className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">No Programs Found</h3>
                  <p className="text-sm md:text-base text-slate-600">
                    {viewMode === 'all' 
                      ? 'No programs match your current filters.'
                      : 'No programs scheduled for the selected time period.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}