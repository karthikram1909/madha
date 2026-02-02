import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Tv, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

import AIFloatingChat from '../components/website/AIFloatingChat';
import DynamicFooter from '../components/website/DynamicFooter';
import PageBanner from "../components/website/PageBanner";

/* =========================================================
   🔴 LIVE STREAM URL (CONFIG)
========================================================= */
const LIVE_STREAM_URL = "https://60e66735799ea.streamlock.net:55/madhatv/madhatv.stream_HDp/playlist.m3u8";
// ⬆️ Replace with real MadhaTV HLS URL in production

/* =========================================================
   LIVE VIDEO PLAYER
========================================================= */
function LiveVideoPlayer() {
  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
      <video
        src={LIVE_STREAM_URL}
        controls
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  );
}

/* =========================================================
   PROGRAM GUIDE
========================================================= */
function ProgramGuide({
  livePrograms,
  upcomingPrograms,
  onProgramSelect,
  selectedProgram,
  isLoading
}) {

  const getCategoryColor = (category) => {
    const colors = {
      live_mass: 'bg-red-100 text-red-800',
      devotional: 'bg-blue-100 text-blue-800',
      rosary: 'bg-purple-100 text-purple-800',
      bible_reflection: 'bg-green-100 text-green-800',
      special_event: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [h, m] = timeString.split(':');
    const t = new Date();
    t.setHours(h, m);
    return format(t, 'h:mm a');
  };

  const getProgramDateTime = (program) => {
    const date = parseISO(program.schedule_date);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const ProgramItem = ({ program, isLive }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onProgramSelect(program)}
      className={`p-4 rounded-lg border cursor-pointer transition ${
        selectedProgram?.id === program.id
          ? 'bg-red-50 border-red-300'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isLive && <span className="text-xs font-bold text-red-600">LIVE</span>}
            <Badge className={`text-xs ${getCategoryColor(program.category)}`}>
              {program.category?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <h4 className="font-semibold text-sm text-slate-900">
            {program.title}
          </h4>
          <p className="text-xs text-slate-600 line-clamp-2">
            {program.description}
          </p>
          <div className="flex gap-3 text-xs text-slate-500 mt-1">
            <span>{getProgramDateTime(program)}</span>
            <span>{formatTime(program.schedule_time)}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          Loading program schedule…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {livePrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Live Now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {livePrograms.map(p => (
              <ProgramItem key={p.id} program={p} isLive />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Coming Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingPrograms.length > 0 ? (
            upcomingPrograms.map(p => (
              <ProgramItem key={p.id} program={p} />
            ))
          ) : (
            <div className="text-center text-slate-500 py-6">
              <Tv className="mx-auto mb-2 opacity-50" />
              No upcoming programs
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => window.open('/Schedule', '_blank')}
      >
        <Calendar className="w-4 h-4 mr-2" />
        View Full Schedule
      </Button>
    </div>
  );
}

/* =========================================================
   MAIN LIVE TV PAGE
========================================================= */
export default function LiveTV() {

  const [currentProgram, setCurrentProgram] = useState(null);
  const [livePrograms, setLivePrograms] = useState([]);
  const [upcomingPrograms, setUpcomingPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        'https://secure.madhatv.in/api/v2/menu_contents.php?action=live&flag=0'
      );
      const json = await res.json();

      console.log('LIVE API RESPONSE:', json);

      const programs = Array.isArray(json.data) ? json.data : [];
      const now = new Date();

      const live = programs.filter(p => p.status === 'live');
      const upcoming = programs.filter(
        p => new Date(p.schedule_date + 'T' + p.schedule_time) > now
      );

      setLivePrograms(live);
      setUpcomingPrograms(upcoming);
      setCurrentProgram(live[0] || upcoming[0] || null);

    } catch (err) {
      console.error('Live TV API error:', err);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AIFloatingChat />

      <PageBanner
        pageKey="live_tv"
        fallbackTitle="Live TV"
        fallbackDescription="Watch Madha TV live – spiritual programs 24/7"
        fallbackImage="https://madhatv.in/images-madha/home/about-banner.png"
      />

      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">

          {/* 🎥 LIVE PLAYER */}
          <div className="lg:col-span-2">
            <LiveVideoPlayer />
          </div>

          {/* 📺 PROGRAM GUIDE */}
          <ProgramGuide
            livePrograms={livePrograms}
            upcomingPrograms={upcomingPrograms}
            selectedProgram={currentProgram}
            onProgramSelect={setCurrentProgram}
            isLoading={isLoading}
          />

        </div>
      </main>

      <DynamicFooter />
    </div>
  );
}
