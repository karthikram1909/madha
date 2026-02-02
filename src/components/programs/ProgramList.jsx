
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Edit,
  Trash2,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCcw,
  CheckCircle,
  Video
} from "lucide-react";
import { format, isToday } from "date-fns";

const getStatusColor = (status) => {
  const colors = {
    live: "bg-red-100 text-red-800",
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100";
};

const getBroadcastTypeColor = (type) => {
  const colors = {
    live: "border-red-500 text-red-600",
    recorded: "border-purple-500 text-purple-600",
    repeat: "border-gray-500 text-gray-600",
  };
  return colors[type] || "border-gray-400";
};

const getTag = (program) => {
    if (program.status === 'live') return <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>;
    if (program.is_featured) return <Badge className="bg-orange-100 text-orange-800"><Sparkles className="w-3 h-3 mr-1"/>SPECIAL</Badge>;
    if (program.broadcast_type === 'recorded') return <Badge className="bg-purple-100 text-purple-800"><Video className="w-3 h-3 mr-1"/>Recorded</Badge>;
    if (program.broadcast_type === 'repeat') return <Badge className="bg-gray-100 text-gray-800"><RefreshCcw className="w-3 h-3 mr-1"/>Repeat</Badge>;
    // Fallback if category is missing or null, ensure safe access
    return program.category ? <Badge variant="outline">{program.category.replace('_', ' ')}</Badge> : null;
};

export default function ProgramList({ programs, onEditProgram, onDeleteProgram, onStatusChange, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
      return <div className="text-center py-10 text-slate-500">No programs found for this filter.</div>
  }

  return (
    <div className="space-y-3">
      {programs.map((program, index) => {
        const today = isToday(new Date(program.schedule_date));
        return (
            <div
                key={program.id}
                className={`p-4 border rounded-lg transition-all duration-300 ${today ? 'bg-yellow-50 border-yellow-200' : 'bg-white'} ${index % 2 !== 0 && !today ? 'bg-slate-50/50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{program.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mt-1">{program.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(program.schedule_date), 'MMM d, yyyy')} at {program.schedule_time}</span>
                    </div>
                    {getTag(program)}
                    <Badge variant="outline" className={program.is_published ? 'text-green-600 border-green-500' : 'text-slate-500 border-slate-400'}>
                        {program.is_published ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                        {program.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-start sm:self-center">
                  {program.status === 'scheduled' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(program.id, 'live')}>
                      <Play className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Go Live</span>
                    </Button>
                  )}
                  {program.status === 'live' && (
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => onStatusChange(program.id, 'completed')}>
                      <Pause className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">End</span>
                    </Button>
                  )}
                   {program.status === 'completed' && (
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Completed</span>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onEditProgram(program)}>
                    <Edit className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button size="sm" variant="destructive-outline" onClick={() => onDeleteProgram(program.id)}>
                    <Trash2 className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
        );
      })}
    </div>
  );
}
