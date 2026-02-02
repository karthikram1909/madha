import React, { useState, useEffect, useMemo } from "react";
import { Program, ProgramImage } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tv,
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  Calendar,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isToday, startOfDay } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import ProgramForm from "../components/programs/ProgramForm";
import BulkImportModal from "../components/programs/BulkImportModal";
import { getProgramImage } from "../components/utils/programImageMapper";
import PageBanner from "../components/website/PageBanner";

export default function ProgramSchedule() {
  const [programs, setPrograms] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Currently selected date to show programs
  const [isFixingDates, setIsFixingDates] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // Sort order for dates list
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isDeletingPrograms, setIsDeletingPrograms] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch programs and images in parallel
      const [programData, allImageData] = await Promise.all([
        Program.list('-created_date'),
        ProgramImage.list()
      ]);
      
      if (!programData || programData.length === 0) {
        setPrograms([]);
        setImageMap({});
        setIsLoading(false);
        return;
      }
      
      // Build image map first
      const newImageMap = (allImageData || []).reduce((map, img) => {
        if (img.filename && img.file_url) {
          map[img.filename] = img.file_url;
        }
        return map;
      }, {});
      
      setImageMap(newImageMap);
      
      // Apply dynamic image assignment - pass uploaded images for matching
      const programsWithImages = programData.map(program => ({
        ...program,
        program_image: getProgramImage(program.title, allImageData || [])
      }));
      
      setPrograms(programsWithImages);

    } catch (error) {
      console.error("Error loading data:", error);
      setPrograms([]);
      setImageMap({});
    }
    setIsLoading(false);
  };

  // Get unique dates (last 10 days + today + future) with program counts
  const upcomingDates = useMemo(() => {
    const today = startOfDay(new Date());
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    
    const dateMap = new Map();
    
    programs.forEach(program => {
      if (!program.schedule_date) return;
      
      const programDate = startOfDay(new Date(program.schedule_date));
      
      // Include dates from last 10 days and all future dates
      if (programDate >= tenDaysAgo) {
        const dateKey = program.schedule_date.split('T')[0]; // Normalize to YYYY-MM-DD
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            date: dateKey,
            dateObj: programDate,
            count: 0,
            isPast: programDate < today
          });
        }
        dateMap.get(dateKey).count++;
      }
    });
    
    // Convert to array and sort by date based on sortOrder
    return Array.from(dateMap.values()).sort((a, b) => 
      sortOrder === 'asc' 
        ? a.dateObj.getTime() - b.dateObj.getTime()
        : b.dateObj.getTime() - a.dateObj.getTime()
    );
  }, [programs, sortOrder]);

  // Filter dates based on search term
  const filteredDates = useMemo(() => {
    if (!searchTerm) return upcomingDates;
    
    const lowerSearch = searchTerm.toLowerCase();
    return upcomingDates.filter(item => {
      const formattedDate = format(new Date(item.date), 'dd-MM-yyyy');
      const dayName = format(new Date(item.date), 'EEEE').toLowerCase();
      return formattedDate.includes(lowerSearch) || 
             item.date.includes(searchTerm) ||
             dayName.includes(lowerSearch);
    });
  }, [upcomingDates, searchTerm]);

  // Get programs for selected date, sorted by time ascending
  const programsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return programs
      .filter(p => p.schedule_date && p.schedule_date.startsWith(selectedDate))
      .sort((a, b) => {
        const timeA = a.schedule_time || '00:00';
        const timeB = b.schedule_time || '00:00';
        return timeA.localeCompare(timeB);
      });
  }, [programs, selectedDate]);

  const handleSaveProgram = async (programData) => {
    try {
      if (!programData.program_image && programData.title) {
        programData.program_image = getProgramImage(programData.title);
      }

      if (selectedProgram?.id) {
        await Program.update(selectedProgram.id, programData);
      } else {
        await Program.create(programData);
      }
      await loadData();
      setShowForm(false);
      setSelectedProgram(null);
    } catch (error) {
      console.error("Error saving program:", error);
    }
  };
  
  const handleDeleteProgram = async (programId) => {
    if (window.confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
      try {
        await Program.delete(programId);
        await loadData();
        if(selectedProgram?.id === programId) {
          setSelectedProgram(null);
          setShowForm(false);
        }
      } catch (error) {
        console.error("Error deleting program:", error);
        alert("Failed to delete program. Please try again.");
      }
    }
  };

  const handleDeleteDaySchedule = async (dateKey, programCount, e) => {
    e.stopPropagation(); // Prevent date click
    
    if (window.confirm(`Are you sure you want to delete all ${programCount} programs scheduled for ${format(new Date(dateKey), 'EEEE, dd MMMM yyyy')}? This action cannot be undone.`)) {
      try {
        // Find all programs for this date
        const programsToDelete = programs.filter(p => 
          p.schedule_date && p.schedule_date.startsWith(dateKey)
        );
        
        // Delete all programs for this date
        await Promise.all(programsToDelete.map(p => Program.delete(p.id)));
        
        // Reload data
        await loadData();
      } catch (error) {
        console.error("Error deleting day schedule:", error);
        alert("Failed to delete day schedule. Please try again.");
      }
    }
  };

  const handleDateCheckboxToggle = (dateKey) => {
    setSelectedDates(prev => {
      if (prev.includes(dateKey)) {
        return prev.filter(d => d !== dateKey);
      } else {
        return [...prev, dateKey];
      }
    });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedDates.length === 0) return;

    const programsToDelete = programs.filter(p => 
      p.schedule_date && selectedDates.some(dateKey => p.schedule_date.startsWith(dateKey))
    );

    if (!programsToDelete.length) {
      alert("No programs found to delete.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${programsToDelete.length} programs from ${selectedDates.length} selected date(s)? This action cannot be undone.`)) {
      setIsDeletingPrograms(true);
      setDeleteProgress({ current: 0, total: programsToDelete.length });
      let successCount = 0;
      let failCount = 0;

      // Delete programs sequentially with delay to avoid rate limiting
      for (let i = 0; i < programsToDelete.length; i++) {
        const program = programsToDelete[i];
        try {
          await Program.delete(program.id);
          successCount++;
          setDeleteProgress({ current: i + 1, total: programsToDelete.length });
          // Add 10ms delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          // Skip 404 errors (program already deleted)
          if (error.response?.status === 404 || error.message?.includes('not found')) {
            console.warn(`Program ${program.id} already deleted, skipping...`);
            successCount++;
            setDeleteProgress({ current: i + 1, total: programsToDelete.length });
          } else {
            console.error(`Failed to delete program ${program.id}:`, error);
            failCount++;
          }
        }
      }
      
      setIsDeletingPrograms(false);
      setDeleteProgress({ current: 0, total: 0 });
      setIsDeleteMode(false);
      setSelectedDates([]);
      await loadData();

      if (failCount > 0) {
        alert(`Deleted ${successCount} programs. ${failCount} programs could not be deleted.`);
      }
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return format(date, 'dd-MM-yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    setSearchTerm("");
  };

  const handleBackToList = () => {
    setSelectedDate(null);
    setSearchTerm("");
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageBanner 
        pageKey="program_schedule"
        fallbackTitle="Program Schedule Management"
        fallbackDescription="Upload, manage, and organize your daily program schedule"
        fallbackImage="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2834&auto=format&fit=crop"
      />
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-8 relative z-10">
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-6 h-6 text-[#B71C1C]" />
                Upload Schedule
              </CardTitle>
              <Button 
                onClick={() => setIsImportModal(true)}
                className="bg-[#B71C1C] hover:bg-[#8B0000]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Excel File
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {selectedDate ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleBackToList}
                      className="mr-2 p-1"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Calendar className="w-6 h-6 text-[#B71C1C]" />
                    Schedule for {format(new Date(selectedDate), 'EEEE, dd MMMM yyyy')}
                    <Badge variant="secondary" className="ml-2">
                      {programsForSelectedDate.length} Programs
                    </Badge>
                  </>
                ) : (
                  <>
                    <Calendar className="w-6 h-6 text-[#B71C1C]" />
                    Schedule Dates ({upcomingDates.length} Dates)
                  </>
                )}
              </CardTitle>
              <div className="flex gap-2 items-center">
                {showForm && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedProgram(null);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                {isDeleteMode ? (
                  <>
                    {isDeletingPrograms && (
                      <div className="flex items-center gap-3 mr-4 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium text-red-900">
                            Deleting {deleteProgress.current} / {deleteProgress.total}
                          </span>
                        </div>
                        <div className="w-48 h-2 bg-red-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-600 transition-all duration-300 ease-out"
                            style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsDeleteMode(false);
                        setSelectedDates([]);
                      }}
                      disabled={isDeletingPrograms}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkDeleteConfirm}
                      disabled={selectedDates.length === 0 || isDeletingPrograms}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Selected ({selectedDates.length})
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => setIsDeleteMode(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      onClick={() => {
                        setSelectedProgram(null);
                        setShowForm(true);
                      }}
                      className="bg-[#B71C1C] hover:bg-[#8B0000]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Program
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {showForm ? (
              <div className="mb-6">
                <ProgramForm 
                  program={selectedProgram}
                  onSave={handleSaveProgram}
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedProgram(null);
                  }}
                />
              </div>
            ) : selectedDate ? (
              // Show programs for selected date
              <>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Program Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {isLoading ? (
                          [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                              <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                            </tr>
                          ))
                        ) : programsForSelectedDate.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                              No programs found for this date.
                            </td>
                          </tr>
                        ) : (
                          programsForSelectedDate.map((program, index) => {
                            // Use the program's assigned image or look it up dynamically
                            const imageFilename = program.program_image || 'madhatv.png';
                            const imageUrl = imageMap[imageFilename];
                            
                            return (
                              <tr 
                                key={program.id} 
                                className={`hover:bg-slate-50 transition-colors ${
                                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                }`}
                              >
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                  {program.schedule_time || '-'}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-900">
                                  <div className="flex items-center gap-3">
                                    {imageUrl ? (
                                      <img src={imageUrl} alt={program.title} className="w-10 h-10 object-cover rounded-md" />
                                    ) : (
                                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                                        <Tv className="w-5 h-5 text-slate-400" />
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-medium">{program.title}</span>
                                      {program.description && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                          {program.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <Badge variant={program.is_published ? 'default' : 'secondary'}>
                                    {program.is_published ? 'Published' : 'Draft'}
                                  </Badge>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedProgram(program);
                                        setShowForm(true);
                                      }}
                                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700" 
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteProgram(program.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              // Show list of upcoming dates
              <>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by date or day name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-40">
                    <Select 
                      value={sortOrder} 
                      onValueChange={(value) => setSortOrder(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending ↑</SelectItem>
                        <SelectItem value="desc">Descending ↓</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="divide-y divide-slate-200">
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
                              <div>
                                <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-24"></div>
                              </div>
                            </div>
                            <div className="h-6 w-16 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      ))
                    ) : filteredDates.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        {searchTerm ? 'No dates match your search.' : 'No upcoming schedule dates found.'}
                      </div>
                    ) : (
                      filteredDates.map((item, index) => {
                        const dateObj = new Date(item.date);
                        const isDateToday = isToday(dateObj);
                        const isPastDate = item.isPast;
                        const isSelected = selectedDates.includes(item.date);

                        return (
                          <div
                            key={item.date}
                            onClick={() => !isDeleteMode && handleDateClick(item.date)}
                            className={`p-4 ${!isDeleteMode ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors flex items-center justify-between ${
                              isDateToday ? 'bg-yellow-50 hover:bg-yellow-100' : 
                              isPastDate ? 'bg-slate-50 opacity-80' : ''
                            } ${isSelected ? 'bg-red-50 border-l-4 border-red-600' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              {isDeleteMode && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleDateCheckboxToggle(item.date)}
                                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                                isDateToday ? 'bg-[#B71C1C] text-white' : 
                                isPastDate ? 'bg-slate-300 text-slate-600' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <span className="text-xs font-medium uppercase">
                                  {format(dateObj, 'MMM')}
                                </span>
                                <span className="text-lg font-bold leading-none">
                                  {format(dateObj, 'd')}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  {format(dateObj, 'EEEE, dd MMMM yyyy')}
                                  {isDateToday && (
                                    <Badge className="bg-[#B71C1C]">Today</Badge>
                                  )}
                                  {isPastDate && (
                                    <Badge variant="secondary" className="text-slate-500">Past</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {item.count} program{item.count !== 1 ? 's' : ''} scheduled
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-slate-600">
                                {item.count} Programs
                              </Badge>
                              {!isDeleteMode && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => handleDeleteDaySchedule(item.date, item.count, e)}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                  <ChevronRight className="w-5 h-5 text-slate-400" />
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModal(false)}
        onImportSuccess={() => {
          setIsImportModal(false);
          loadData();
        }}
      />
    </div>
  );
}