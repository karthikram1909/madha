import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, Tv } from 'lucide-react';

export default function LiveMetrics({ livePrograms }) {
  const [viewerCount, setViewerCount] = useState(1247);
  const [streamHealth, setStreamHealth] = useState('excellent');

  useEffect(() => {
    // Simulate live viewer count updates
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 20) - 10);
      
      // Simulate stream health changes
      const healthStates = ['excellent', 'good', 'poor'];
      const randomHealth = healthStates[Math.floor(Math.random() * healthStates.length)];
      setStreamHealth(randomHealth);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = () => {
    switch (streamHealth) {
      case 'excellent':
        return 'text-emerald-500';
      case 'good':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-slate-600" />
            <span className="font-medium">Live Programs</span>
          </div>
          <span className="font-bold text-lg">{livePrograms}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-600" />
            <span className="font-medium">Current Viewers</span>
          </div>
          <span className="font-bold text-lg">{viewerCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-slate-600" />
            <span className="font-medium">Stream Health</span>
          </div>
          <span className={`font-bold text-lg capitalize ${getHealthColor()}`}>{streamHealth}</span>
        </div>
      </CardContent>
    </Card>
  );
}