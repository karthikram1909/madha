import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wifi,
  Users,
  AlertTriangle,
  CheckCircle,
  Pause,
  RotateCcw,
  Activity
} from "lucide-react";

const getStreamHealthIcon = (health) => {
  switch (health) {
    case 'excellent':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'good':
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    case 'poor':
      return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    default:
      return <AlertTriangle className="w-5 h-5 text-gray-400" />;
  }
};

const getStreamHealthColor = (health) => {
  const colors = {
    excellent: "bg-green-100 text-green-800 border-green-200",
    good: "bg-blue-100 text-blue-800 border-blue-200",
    poor: "bg-orange-100 text-orange-800 border-orange-200",
    offline: "bg-gray-100 text-gray-800 border-gray-200"
  };
  return colors[health] || "bg-gray-100 text-gray-800 border-gray-200";
};

export default function StreamMonitor({ programs, onStatusChange }) {
  return (
    <Card className="bg-gradient-to-r from-red-900 to-red-800 text-white shadow-xl border-0 mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Wifi className="w-6 h-6" />
          Live Stream Monitor
          <Badge className="bg-white/20 text-white ml-2">
            {programs.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{program.title}</h3>
                  <p className="text-red-100 text-sm line-clamp-2">{program.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  <Badge className="bg-red-500 text-white border-red-400">
                    LIVE
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm text-red-100">Viewers</span>
                  </div>
                  <p className="text-xl font-bold">{program.viewer_count?.toLocaleString() || '0'}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm text-red-100">Stream Health</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    {getStreamHealthIcon(program.stream_health)}
                    <span className="font-medium capitalize">{program.stream_health}</span>
                  </div>
                </div>
              </div>

              {/* Stream Health Status */}
              <div className={`rounded-md p-3 mb-4 border ${getStreamHealthColor(program.stream_health)} bg-white/20`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {program.stream_health === 'excellent' && 'Stream is running perfectly'}
                    {program.stream_health === 'good' && 'Stream is stable with minor issues'}
                    {program.stream_health === 'poor' && 'Stream has connectivity issues'}
                    {program.stream_health === 'offline' && 'Stream is offline'}
                  </span>
                  {program.failover_triggered && (
                    <Badge variant="outline" className="border-orange-300 text-orange-100">
                      Failover Active
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20"
                  onClick={() => onStatusChange(program.id, 'completed')}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  End Stream
                </Button>
                
                {program.failover_triggered && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-100 hover:bg-orange-500/20"
                    onClick={() => {
                      // Reset failover - in real app this would call an API
                      console.log('Reset failover for program:', program.id);
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset Failover
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/20"
                  onClick={() => {
                    // Open stream monitoring details
                    console.log('View details for program:', program.id);
                  }}
                >
                  View Details
                </Button>
              </div>

              {/* Technical Info */}
              <div className="mt-3 pt-3 border-t border-white/20 text-xs text-red-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>Primary: {program.rtmp_link ? 'Connected' : 'Not Set'}</div>
                  <div>Backup: {program.backup_rtmp_link ? 'Ready' : 'Not Set'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}