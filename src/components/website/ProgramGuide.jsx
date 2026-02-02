
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Calendar, 
  Tv,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProgramGuide({ 
  livePrograms, 
  upcomingPrograms, 
  onProgramSelect, 
  selectedProgram,
  isLoading,
  theme = 'dark' // Add theme prop with 'dark' as default
}) {
  
  const themeClasses = {
    dark: {
      card: 'bg-slate-800/50 border-slate-700 backdrop-blur-sm',
      title: 'text-white',
      itemBg: 'bg-white',
      itemBorder: 'border-slate-200',
      itemHover: 'hover:bg-slate-50 hover:border-slate-300',
      itemSelectedBg: 'bg-red-50',
      itemSelectedBorder: 'border-red-300',
      itemTitle: 'text-slate-900',
      itemText: 'text-slate-600',
      itemMeta: 'text-slate-500',
      itemArrow: 'text-slate-400',
      emptyText: 'text-slate-400',
      button: 'border-slate-600 text-white hover:bg-slate-700'
    },
    light: {
      card: 'bg-white/90 border-slate-200 backdrop-blur-sm shadow-xl',
      title: 'text-slate-900',
      itemBg: 'bg-white',
      itemBorder: 'border-slate-200',
      itemHover: 'hover:bg-slate-50 hover:border-slate-300',
      itemSelectedBg: 'bg-red-50',
      itemSelectedBorder: 'border-red-300',
      itemTitle: 'text-slate-900',
      itemText: 'text-slate-600',
      itemMeta: 'text-slate-500',
      itemArrow: 'text-slate-400',
      emptyText: 'text-slate-500',
      button: 'border-slate-300 text-slate-700 hover:bg-slate-100'
    }
  };

  const currentTheme = themeClasses[theme];

  const getCategoryColor = (category) => {
    const colors = {
      live_mass: 'bg-red-100 text-red-800 border-red-200',
      devotional: 'bg-blue-100 text-blue-800 border-blue-200',
      rosary: 'bg-purple-100 text-purple-800 border-purple-200',
      bible_reflection: 'bg-green-100 text-green-800 border-green-200',
      special_event: 'bg-orange-100 text-orange-800 border-orange-200',
      documentary: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return format(time, 'h:mm a');
  };

  const getProgramDateTime = (program) => {
    const date = parseISO(program.schedule_date);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const ProgramItem = ({ program, isLive = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        selectedProgram?.id === program.id
          ? `${currentTheme.itemSelectedBg} ${currentTheme.itemSelectedBorder} shadow-md`
          : `${currentTheme.itemBg} ${currentTheme.itemBorder} ${currentTheme.itemHover}`
      }`}
      onClick={() => onProgramSelect(program)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isLive && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-red-600">LIVE</span>
              </div>
            )}
            <Badge 
              variant="outline" 
              className={`text-xs ${getCategoryColor(program.category)}`}
            >
              {program.category?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          <h4 className={`font-semibold ${currentTheme.itemTitle} text-sm leading-tight mb-1 truncate`}>
            {program.title}
          </h4>
          
          <p className={`text-xs ${currentTheme.itemText} line-clamp-2 mb-2`}>
            {program.description}
          </p>
          
          <div className={`flex items-center gap-3 text-xs ${currentTheme.itemMeta}`}>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {getProgramDateTime(program)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(program.schedule_time)}
            </div>
          </div>
        </div>
        
        <ChevronRight className={`w-4 h-4 ${currentTheme.itemArrow} flex-shrink-0`} />
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <Card className={currentTheme.card}>
        <CardHeader>
          <CardTitle className={currentTheme.title}>Program Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`p-4 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'} rounded-lg animate-pulse`}>
                <div className={`h-4 ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'} rounded mb-2`} />
                <div className={`h-3 ${theme === 'dark' ? 'bg-slate-600' : 'bg-slate-300'} rounded w-2/3`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Programs */}
      {livePrograms.length > 0 && (
        <Card className={currentTheme.card}>
          <CardHeader className="pb-3">
            <CardTitle className={`${currentTheme.title} text-lg flex items-center gap-2`}>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              Live Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {livePrograms.map(program => (
                  <ProgramItem key={program.id} program={program} isLive={true} />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Programs */}
      <Card className={currentTheme.card}>
        <CardHeader className="pb-3">
          <CardTitle className={`${currentTheme.title} text-lg flex items-center gap-2`}>
            <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            Coming Up
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingPrograms.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {upcomingPrograms.map(program => (
                  <ProgramItem key={program.id} program={program} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`text-center py-8 ${currentTheme.emptyText}`}>
              <Tv className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming programs scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule Link */}
      <Card className={currentTheme.card}>
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            className={`w-full ${currentTheme.button}`}
            onClick={() => window.open('/Schedule', '_blank')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Full Schedule
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
