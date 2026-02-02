import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Clock } from "lucide-react";
import { format } from "date-fns";

const getCategoryColor = (category) => {
  const colors = {
    healing: "bg-green-100 text-green-800",
    family: "bg-blue-100 text-blue-800",
    thanksgiving: "bg-orange-100 text-orange-800",
    guidance: "bg-purple-100 text-purple-800",
    peace: "bg-indigo-100 text-indigo-800",
    general: "bg-gray-100 text-gray-800"
  };
  return colors[category] || "bg-slate-100 text-slate-800";
};

export default function PrayerWallPublic({ prayers, contentTemplates }) {
  const getPrayerHeader = () => {
    const template = contentTemplates.find(t => t.template_key === 'prayer_wall_header');
    return template?.content_english || 'Join our community in prayer. Submit your request and we will pray with you.';
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#B71C1C]" />
              Prayer Wall
            </CardTitle>
            <p className="text-slate-600 mt-1">{getPrayerHeader()}</p>
          </div>
          <Button className="bg-[#B71C1C] hover:bg-[#D32F2F]">
            <Plus className="w-4 h-4 mr-2" />
            Submit Prayer
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {prayers.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No prayer requests to display</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prayers.map((prayer) => (
              <div key={prayer.id} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{prayer.requester_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(prayer.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge className={getCategoryColor(prayer.prayer_category)}>
                    {prayer.prayer_category}
                  </Badge>
                </div>
                
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-4">
                  {prayer.prayer_text}
                </p>
                
                {prayer.is_urgent && (
                  <div className="mt-3">
                    <Badge variant="outline" className="border-red-200 text-red-600 text-xs">
                      Urgent Prayer
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Button variant="outline" className="border-[#B71C1C] text-[#B71C1C] hover:bg-red-50">
            View All Prayers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}