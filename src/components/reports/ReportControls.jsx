import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function ReportControls({ onGenerate, isGenerating }) {
    const [reportType, setReportType] = useState('donations');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [serviceType, setServiceType] = useState('all');
    const [publishStatus, setPublishStatus] = useState('all');

    const handleGenerateClick = () => {
        const filters = {
            type: reportType,
            dateRange: {
                from: dateFrom ? new Date(dateFrom) : null,
                to: dateTo ? new Date(dateTo) : null,
            },
            service_type: serviceType,
            published: publishStatus === 'all' ? null : publishStatus === 'published'
        };
        onGenerate(filters);
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
                <label className="text-sm font-medium block mb-2">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger><SelectValue placeholder="Select a report" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="donations">Donations</SelectItem>
                        <SelectItem value="bookings">Service Bookings</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            {reportType === 'bookings' && (
                <>
                    <div>
                        <label className="text-sm font-medium block mb-2">Service Type</label>
                        <Select value={serviceType} onValueChange={setServiceType}>
                            <SelectTrigger><SelectValue placeholder="Service Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Services</SelectItem>
                                <SelectItem value="holy_mass">Holy Mass</SelectItem>
                                <SelectItem value="prayer_support">Prayer Support</SelectItem>
                                <SelectItem value="rosary_blessing">Rosary Blessing</SelectItem>
                                <SelectItem value="birthday_service">Birthday Service</SelectItem>
                                <SelectItem value="deathday_service">Death Anniversary</SelectItem>
                                <SelectItem value="marriage_blessing">Marriage Blessing</SelectItem>
                                <SelectItem value="healing_novena">Healing Novena</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-2">Publish Status</label>
                        <Select value={publishStatus} onValueChange={setPublishStatus}>
                            <SelectTrigger><SelectValue placeholder="Publish Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="unpublished">Unpublished</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            <div>
                <label className="text-sm font-medium block mb-2">From Date</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
                <label className="text-sm font-medium block mb-2">To Date</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <Button onClick={handleGenerateClick} disabled={isGenerating} className="bg-[#B71C1C] hover:bg-[#D32F2F] w-full">
                {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
        </div>
    );
}