import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Sample data - Replace with actual Google Analytics data when integrated
const generateSampleData = () => {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      pageViews: Math.floor(Math.random() * 5000) + 2000,
      uniqueVisitors: Math.floor(Math.random() * 2000) + 800,
      sessions: Math.floor(Math.random() * 3000) + 1000,
    });
  }
  return last7Days;
};

const topPages = [
  { page: '/home', views: 12450, avgTime: '2:45', bounceRate: '32%' },
  { page: '/live-tv', views: 8320, avgTime: '5:12', bounceRate: '18%' },
  { page: '/schedule', views: 5890, avgTime: '1:34', bounceRate: '45%' },
  { page: '/donation', views: 4560, avgTime: '3:21', bounceRate: '28%' },
  { page: '/book-service', views: 3890, avgTime: '4:05', bounceRate: '22%' },
  { page: '/gallery', views: 2340, avgTime: '2:15', bounceRate: '38%' },
  { page: '/shows', views: 2100, avgTime: '3:45', bounceRate: '25%' },
  { page: '/prayer-request', views: 1890, avgTime: '2:30', bounceRate: '35%' },
];

const trafficSources = [
  { name: 'Organic Search', value: 45, color: '#10B981' },
  { name: 'Direct', value: 25, color: '#3B82F6' },
  { name: 'Social Media', value: 18, color: '#F59E0B' },
  { name: 'Referral', value: 8, color: '#8B5CF6' },
  { name: 'Email', value: 4, color: '#EF4444' },
];

const deviceData = [
  { name: 'Mobile', value: 58, color: '#3B82F6' },
  { name: 'Desktop', value: 35, color: '#10B981' },
  { name: 'Tablet', value: 7, color: '#F59E0B' },
];

const countryData = [
  { country: 'India', visitors: 45000, percentage: '68%' },
  { country: 'United States', visitors: 8500, percentage: '13%' },
  { country: 'United Kingdom', visitors: 4200, percentage: '6%' },
  { country: 'Canada', visitors: 2800, percentage: '4%' },
  { country: 'Australia', visitors: 2100, percentage: '3%' },
  { country: 'Others', visitors: 3900, percentage: '6%' },
];

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <Card className="bg-white shadow-lg border-0">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className={`flex items-center mt-2 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            <span>{change} vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    // Simulate API call - Replace with actual Google Analytics API call
    setTimeout(() => {
      setTrafficData(generateSampleData());
      setIsLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    loadAnalyticsData();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div 
        className="relative bg-cover bg-center h-52" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-red-100 max-w-2xl text-lg">Track website performance, user engagement, and traffic metrics</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Today</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2" disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Google Analytics Integration Notice */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Google Analytics Integration</p>
                <p className="text-sm text-amber-700 mt-1">
                  To display real analytics data, integrate your Google Analytics property. Currently showing sample data for demonstration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Page Views"
            value="45,892"
            change="+12.5%"
            changeType="up"
            icon={Eye}
            color="bg-blue-500"
          />
          <StatCard
            title="Unique Visitors"
            value="18,234"
            change="+8.3%"
            changeType="up"
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="Avg. Time on Page"
            value="3:24"
            change="+5.2%"
            changeType="up"
            icon={Clock}
            color="bg-purple-500"
          />
          <StatCard
            title="Bounce Rate"
            value="34.2%"
            change="-2.1%"
            changeType="up"
            icon={TrendingDown}
            color="bg-amber-500"
          />
        </div>

        {/* Traffic Chart */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Website Traffic Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorPageViews)" 
                    name="Page Views"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="uniqueVisitors" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                    name="Unique Visitors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-green-600" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                      <span className="text-gray-700">{source.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{source.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-600" />
                Device Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" stroke="#6B7280" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">58%</p>
                  <p className="text-xs text-gray-500">Mobile</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Monitor className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">35%</p>
                  <p className="text-xs text-gray-500">Desktop</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <Monitor className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">7%</p>
                  <p className="text-xs text-gray-500">Tablet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages Table */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Top Performing Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Page</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Page Views</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Avg. Time</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Bounce Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((page, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-5">{index + 1}.</span>
                          <span className="text-sm font-medium text-gray-900">{page.page}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-gray-700">{page.views.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-sm text-gray-700">{page.avgTime}</td>
                      <td className="text-right py-3 px-4">
                        <span className={`text-sm font-medium ${parseFloat(page.bounceRate) > 35 ? 'text-red-600' : 'text-green-600'}`}>
                          {page.bounceRate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Data */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Traffic by Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.country}</p>
                      <p className="text-xs text-gray-500">{item.visitors.toLocaleString()} visitors</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{item.percentage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}