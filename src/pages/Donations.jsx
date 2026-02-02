
import React, { useState, useEffect } from 'react';
import { Donation } from '@/api/entities';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DonationList from '../components/donations/DonationList';
import DonationFilters from '../components/donations/DonationFilters';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportDonations } from "@/api/functions";
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast for notifications

export default function DonationsPage() {
    const [donations, setDonations] = useState([]);
    const [filteredDonations, setFilteredDonations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [donationsPerPage] = useState(20); // This can be a const as it's not expected to change
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
        method: 'all',
        searchTerm: ''
    });

    useEffect(() => {
        loadDonations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [donations, filters]);

    const loadDonations = async () => {
        setIsLoading(true);
        try {
            const data = await Donation.list('-created_date');
            setDonations(data);
        } catch (error) {
            console.error("Error loading donations:", error);
            toast.error("Failed to load donations.");
        }
        setIsLoading(false);
    };

    const applyFilters = () => {
        let filtered = [...donations];
        const { status, type, method, searchTerm } = filters;

        if (status !== 'all') {
            filtered = filtered.filter(d => d.payment_status === status);
        }
        if (type !== 'all') {
            filtered = filtered.filter(d => d.donation_type === type);
        }
        if (method !== 'all') {
            filtered = filtered.filter(d => d.payment_method === method);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(d =>
                (d.donor_name || '').toLowerCase().includes(term) ||
                (d.donor_email || '').toLowerCase().includes(term) ||
                (d.payment_id || '').toLowerCase().includes(term)
            );
        }
        setFilteredDonations(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };
    
    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            const response = await exportDonations({ format, filters });
            
            const blob = new Blob([response.data], { 
                type: format === 'csv' ? 'text/csv' : 'application/pdf' 
            });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `donations.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast.success(`Donations exported as ${format.toUpperCase()} successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error(`Failed to export as ${format.toUpperCase()}`);
        }
        setIsExporting(false);
    };

    // Pagination logic
    const indexOfLastDonation = currentPage * donationsPerPage;
    const indexOfFirstDonation = indexOfLastDonation - donationsPerPage;
    const currentDonations = filteredDonations.slice(indexOfFirstDonation, indexOfLastDonation);
    const totalPages = Math.ceil(filteredDonations.length / donationsPerPage);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div 
              className="relative bg-cover bg-center h-52" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583344692138-2d1a58849354?q=80&w=2831&auto=format&fit=crop')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#dc2626]/80 to-[#dc2626]/30" />
              <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">Donations Management</h1>
                <p className="text-red-100 max-w-2xl text-lg shadow-lg">Track, filter, and manage all financial contributions to Madha TV.</p>
              </div>
            </div>

            <div className="p-6 md:p-8 max-w-7xl mx-auto -mt-16 relative z-10">
                {/* DonationStats component removed as per requirements */}
                
                <Card className="mt-8 bg-white shadow-lg border-0">
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <DonationFilters filters={filters} setFilters={setFilters} />
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleExport('csv')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 mr-2"/>
                                    {isExporting ? 'Exporting...' : 'Export CSV'}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <Download className="w-4 h-4 mr-2"/>
                                    {isExporting ? 'Exporting...' : 'Export PDF'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DonationList 
                            donations={currentDonations} 
                            isLoading={isLoading}
                        />
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-700">
                                    Showing {indexOfFirstDonation + 1} to {Math.min(indexOfLastDonation, filteredDonations.length)} of {filteredDonations.length} entries
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const startPage = Math.max(1, currentPage - 2);
                                        const page = Math.min(totalPages, startPage + i);
                                        
                                        // Ensure the page number is valid and within totalPages
                                        if (page < 1) return null;
                                        if (page > totalPages) return null;

                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
