import React, { useState, useEffect, useMemo } from 'react';
import { Feedback } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Search, Eye, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { toast } from 'sonner';

const FeedbackPage = () => {
    const [feedback, setFeedback] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all',
        category: 'all',
        rating: 'all'
    });
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        setIsLoading(true);
        try {
            const data = await Feedback.list('-created_date');
            setFeedback(data);
        } catch (error) {
            console.error("Error loading feedback:", error);
        }
        setIsLoading(false);
    };

    const handleUpdateStatus = async (feedbackId, newStatus) => {
        try {
            await Feedback.update(feedbackId, { status: newStatus });
            await loadFeedback();
            toast.success('Feedback status updated successfully');
        } catch (error) {
            console.error("Error updating feedback status:", error);
            toast.error('Failed to update feedback status');
        }
    };

    const filteredFeedback = useMemo(() => {
        let filtered = feedback;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item => 
                (item.user_id && item.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                item.comment.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(item => item.status === filters.status);
        }

        // Category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Rating filter
        if (filters.rating !== 'all') {
            const ratingValue = parseInt(filters.rating);
            filtered = filtered.filter(item => item.rating === ratingValue);
        }

        return filtered;
    }, [searchTerm, feedback, filters]);

    const getFeedbackStats = () => {
        const total = feedback.length;
        const newFeedback = feedback.filter(f => f.status === 'new').length;
        const resolved = feedback.filter(f => f.status === 'resolved').length;
        const avgRating = feedback.length > 0 
            ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
            : 0;

        return { total, newFeedback, resolved, avgRating };
    };

    const stats = getFeedbackStats();

    const RatingStars = ({ rating }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            ))}
            <span className="ml-2 text-sm text-slate-600">({rating}/5)</span>
        </div>
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'general': return 'bg-blue-100 text-blue-800';
            case 'live_stream': return 'bg-red-100 text-red-800';
            case 'mass_service': return 'bg-purple-100 text-purple-800';
            case 'donation_experience': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2874&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#B71C1C]/80 to-[#B71C1C]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Feedback Management</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Review and manage user feedback to improve our services</p>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Total Feedback</p>
                                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                                </div>
                                <MessageSquare className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">New Feedback</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.newFeedback}</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-lg">📨</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Resolved</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                                </div>
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Avg Rating</p>
                                    <p className="text-3xl font-bold text-amber-600">{stats.avgRating}</p>
                                </div>
                                <Star className="w-8 h-8 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Feedback Management */}
                <Card className="bg-white shadow-lg border-0">
                    <CardHeader className="border-b border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-[#B71C1C]" />
                                User Feedback ({filteredFeedback.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search feedback..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="live_stream">Live Stream</SelectItem>
                                    <SelectItem value="mass_service">Mass Service</SelectItem>
                                    <SelectItem value="donation_experience">Donation Experience</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filters.rating} onValueChange={(value) => setFilters({...filters, rating: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Feedback Table */}
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B71C1C] mx-auto"></div>
                                <p className="mt-4 text-slate-500">Loading feedback...</p>
                            </div>
                        ) : filteredFeedback.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No feedback found matching your filters.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">User</TableHead>
                                            <TableHead className="font-semibold">Rating</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">Comment</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredFeedback.map(item => (
                                            <TableRow key={item.id} className="hover:bg-slate-50">
                                                <TableCell className="text-sm">
                                                    {format(new Date(item.created_date), 'MMM d, yyyy')}
                                                    <br />
                                                    <span className="text-xs text-slate-500">
                                                        {format(new Date(item.created_date), 'hh:mm a')}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{item.user_id || 'Anonymous'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <RatingStars rating={item.rating} />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getCategoryColor(item.category)}>
                                                        {item.category?.replace('_', ' ') || 'General'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="text-sm text-slate-600 truncate" title={item.comment}>
                                                        {item.comment}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(item.status)}>
                                                        {item.status?.replace('_', ' ') || 'New'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedFeedback(item)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        {item.status !== 'resolved' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleUpdateStatus(item.id, 'resolved')}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback Detail Modal */}
                {selectedFeedback && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold">Feedback Details</h3>
                                <Button variant="ghost" onClick={() => setSelectedFeedback(null)}>
                                    ×
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">User</label>
                                    <p className="text-slate-900">{selectedFeedback.user_id || 'Anonymous'}</p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Rating</label>
                                    <div className="mt-1">
                                        <RatingStars rating={selectedFeedback.rating} />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Category</label>
                                    <div className="mt-1">
                                        <Badge className={getCategoryColor(selectedFeedback.category)}>
                                            {selectedFeedback.category?.replace('_', ' ') || 'General'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Comment</label>
                                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg mt-1">
                                        {selectedFeedback.comment}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Status</label>
                                    <div className="mt-1">
                                        <Badge className={getStatusColor(selectedFeedback.status)}>
                                            {selectedFeedback.status?.replace('_', ' ') || 'New'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Submitted</label>
                                    <p className="text-slate-900">
                                        {format(new Date(selectedFeedback.created_date), 'PPpp')}
                                    </p>
                                </div>
                                
                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={() => handleUpdateStatus(selectedFeedback.id, 'in_progress')}
                                        variant="outline"
                                        disabled={selectedFeedback.status === 'in_progress'}
                                    >
                                        Mark In Progress
                                    </Button>
                                    <Button
                                        onClick={() => handleUpdateStatus(selectedFeedback.id, 'resolved')}
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={selectedFeedback.status === 'resolved'}
                                    >
                                        Mark Resolved
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackPage;